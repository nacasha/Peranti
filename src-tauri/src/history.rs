//! Closed tab history, kept in a SQLite file in the app data folder.
//!
//! An entry is split over three tables, so nothing is stored twice:
//! - `history`: list metadata, and the applet state minus its input and
//!   output values
//! - `history_value`: each input and output value as text, which is what
//!   searching, previews and snippets read
//! - `history_blob`: the bytes of binary values (files, buffers), which the
//!   values hold placeholders for
//!
//! Values and blobs are removed together with their entry.

use std::sync::Mutex;

use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use tauri::ipc::{InvokeBody, Request, Response};
use tauri::{AppHandle, Manager, State};

const SCHEMA: &str = "
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS history (
        session_id   TEXT PRIMARY KEY,
        applet_id    TEXT NOT NULL,
        tool_name    TEXT NOT NULL DEFAULT '',
        session_name TEXT,
        deleted_at   INTEGER NOT NULL,
        state        TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS history_deleted_at ON history (deleted_at DESC);

    CREATE TABLE IF NOT EXISTS history_value (
        session_id TEXT NOT NULL REFERENCES history (session_id) ON DELETE CASCADE,
        source     TEXT NOT NULL,
        key        TEXT NOT NULL,
        position   INTEGER NOT NULL,
        kind       TEXT NOT NULL,
        text       TEXT NOT NULL,
        PRIMARY KEY (session_id, source, key)
    );

    CREATE TABLE IF NOT EXISTS history_blob (
        session_id TEXT NOT NULL REFERENCES history (session_id) ON DELETE CASCADE,
        blob_id    TEXT NOT NULL,
        data       BLOB NOT NULL,
        PRIMARY KEY (session_id, blob_id)
    );
";

/// Bytes an entry takes: its state, values and blobs. Byte lengths come from
/// the record headers, so the values themselves aren't read.
const SIZE_EXPRESSION: &str = "COALESCE(octet_length(history.state), 0)
    + COALESCE((SELECT SUM(octet_length(text)) FROM history_value WHERE history_value.session_id = history.session_id), 0)
    + COALESCE((SELECT SUM(length(data)) FROM history_blob WHERE history_blob.session_id = history.session_id), 0)";

/// Entries whose tool name, tab name or any value contains the `?1` pattern,
/// or every entry when it's NULL
const SEARCH_FILTER: &str = "WHERE ?1 IS NULL
    OR history.tool_name LIKE ?1 ESCAPE '\\'
    OR history.session_name LIKE ?1 ESCAPE '\\'
    OR EXISTS (
        SELECT 1 FROM history_value
        WHERE history_value.session_id = history.session_id AND history_value.text LIKE ?1 ESCAPE '\\'
    )";

/// Characters of context kept on each side of a search match. Little before
/// it, since the snippet shares a single line and the match must stay in view.
const SNIPPET_BEFORE: usize = 16;
const SNIPPET_AFTER: usize = 80;

/// Length of the one-line preview, and of the value head read for it.
/// The head is longer since collapsing whitespace shortens it.
const PREVIEW_LENGTH: usize = 160;
const PREVIEW_SOURCE_LENGTH: usize = PREVIEW_LENGTH * 4;

pub struct HistoryDb(Mutex<Connection>);

impl HistoryDb {
    pub fn open(app: &AppHandle) -> Result<Self, String> {
        let dir = app.path().app_data_dir().map_err(to_message)?;
        std::fs::create_dir_all(&dir).map_err(to_message)?;

        let conn = Connection::open(dir.join("history.sqlite")).map_err(to_message)?;
        conn.execute_batch(SCHEMA).map_err(to_message)?;

        Ok(Self(Mutex::new(conn)))
    }

    fn conn(&self) -> Result<std::sync::MutexGuard<'_, Connection>, String> {
        self.0.lock().map_err(to_message)
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum FieldSource {
    Input,
    Output,
}

impl FieldSource {
    fn as_str(self) -> &'static str {
        match self {
            FieldSource::Input => "input",
            FieldSource::Output => "output",
        }
    }

    fn parse(source: &str) -> Self {
        if source == "input" {
            FieldSource::Input
        } else {
            FieldSource::Output
        }
    }
}

/// How a value's text is stored: as is, or as the JSON of a non-string value
#[derive(Clone, Copy, Debug, PartialEq, Deserialize)]
#[serde(rename_all = "lowercase")]
enum ValueKind {
    Text,
    Json,
}

impl ValueKind {
    fn as_str(self) -> &'static str {
        match self {
            ValueKind::Text => "text",
            ValueKind::Json => "json",
        }
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct HistorySnapshotValue {
    source: FieldSource,
    key: String,
    kind: ValueKind,
    text: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistorySnapshot {
    session_id: String,
    applet_id: String,
    tool_name: String,
    session_name: Option<String>,
    deleted_at: i64,
    /// Applet state without its input and output values, which are `values`
    state: Value,
    /// Input then output values, in field order. Binary values in them are
    /// placeholders naming their blob.
    values: Vec<HistorySnapshotValue>,
}

/// JSON head of a `history_add` request; the blobs' bytes follow it
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AddRequestHead {
    entry: HistorySnapshot,
    max_entries: i64,
    /// In the order their bytes follow the head
    blobs: Vec<BlobHead>,
}

#[derive(Deserialize)]
struct BlobHead {
    id: String,
    length: usize,
}

#[derive(Debug, PartialEq, Serialize)]
pub struct FieldRef {
    source: FieldSource,
    key: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    session_id: String,
    applet_id: String,
    session_name: Option<String>,
    deleted_at: i64,
    size: i64,
    preview: Option<String>,
    // Only set on search results:
    /// Text around the first match in a value
    search_result_preview: Option<String>,
    /// The value that preview comes from
    search_result_field: Option<FieldRef>,
}

#[derive(Serialize)]
pub struct HistoryPage {
    items: Vec<HistoryEntry>,
    total: i64,
}

/// One input or output value of a stored tab, e.g. for the list preview
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryField {
    source: FieldSource,
    key: String,
    /// Cut the value to this many characters, as text, before sending it.
    /// For fields shown as one line, whose value can be many MB.
    #[serde(default)]
    max_length: Option<usize>,
}

fn to_message<E: ToString>(error: E) -> String {
    error.to_string()
}

/// A stored value back as JSON: text as a string, the rest parsed
fn to_value(kind: &str, text: String) -> Value {
    if kind == ValueKind::Json.as_str() {
        serde_json::from_str(&text).unwrap_or(Value::String(text))
    } else {
        Value::String(text)
    }
}

/// Drops everything past the newest `max_entries`, values and blobs included.
/// A negative `max_entries` means unlimited, so nothing is dropped.
fn trim(conn: &Connection, max_entries: i64) -> Result<(), String> {
    if max_entries < 0 {
        return Ok(());
    }

    conn.execute(
        "DELETE FROM history WHERE session_id IN (
            SELECT session_id FROM history ORDER BY deleted_at DESC LIMIT -1 OFFSET ?1
        )",
        params![max_entries.max(0)],
    )
    .map_err(to_message)?;
    Ok(())
}

/// `LIKE` pattern matching `query` anywhere, with its wildcards escaped
fn like_pattern(query: &str) -> String {
    let escaped = query
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_");
    format!("%{escaped}%")
}

/// One line from the head of a value, "…" ending it when the value goes on
/// past it. `is_complete` tells whether `head` is the whole value.
fn make_preview(head: &str, is_complete: bool) -> Option<String> {
    let collapsed = head.split_whitespace().collect::<Vec<_>>().join(" ");
    let mut preview: String = collapsed.chars().take(PREVIEW_LENGTH).collect();
    if preview.is_empty() {
        return None;
    }

    if !is_complete || collapsed.chars().count() > PREVIEW_LENGTH {
        preview.push('…');
    }

    Some(preview)
}

/// Byte offset of the first ASCII case-insensitive match, like SQLite's `LIKE`.
/// Compares in place rather than lowering a copy, since `text` can be many MB.
/// A match always starts on a char boundary: only ASCII bytes are folded, so
/// the window's first byte is the needle's first byte, a char start.
fn find_ignore_ascii_case(text: &str, needle: &str) -> Option<usize> {
    let needle = needle.as_bytes();
    if needle.is_empty() {
        return Some(0);
    }

    text.as_bytes()
        .windows(needle.len())
        .position(|window| window.eq_ignore_ascii_case(needle))
}

/// One-line excerpt of `text` around the first match of `query`
fn make_snippet(text: &str, query: &str) -> Option<String> {
    let start = find_ignore_ascii_case(text, query)?;
    let end = start + query.len();

    let mut from = start.saturating_sub(SNIPPET_BEFORE);
    while !text.is_char_boundary(from) {
        from -= 1;
    }

    let mut to = (end + SNIPPET_AFTER).min(text.len());
    while !text.is_char_boundary(to) {
        to += 1;
    }

    let mut snippet = text[from..to].split_whitespace().collect::<Vec<_>>().join(" ");
    if from > 0 {
        snippet.insert(0, '…');
    }
    if to < text.len() {
        snippet.push('…');
    }

    Some(snippet)
}

/// Splits a `history_add` body: a little-endian u32 length, that many bytes
/// of JSON head, then each blob's bytes back to back, as the head lists them
fn parse_add_request(body: &[u8]) -> Result<(AddRequestHead, Vec<(String, &[u8])>), String> {
    let invalid = || "Malformed history entry".to_string();

    let head_length = u32::from_le_bytes(body.get(..4).ok_or_else(invalid)?.try_into().map_err(|_| invalid())?) as usize;
    let head_end = 4usize.checked_add(head_length).ok_or_else(invalid)?;
    let head: AddRequestHead = serde_json::from_slice(body.get(4..head_end).ok_or_else(invalid)?).map_err(to_message)?;

    let mut offset = head_end;
    let mut blobs = Vec::with_capacity(head.blobs.len());
    for blob in &head.blobs {
        let end = offset.checked_add(blob.length).ok_or_else(invalid)?;
        blobs.push((blob.id.clone(), body.get(offset..end).ok_or_else(invalid)?));
        offset = end;
    }

    if offset != body.len() {
        return Err(invalid());
    }

    Ok((head, blobs))
}

/// Saves an entry with its values and blobs in one transaction, replacing an
/// entry of the same session, then trims the history to `max_entries`
fn insert_entry(conn: &mut Connection, head: &AddRequestHead, blobs: &[(String, &[u8])]) -> Result<(), String> {
    let entry = &head.entry;
    let state = serde_json::to_string(&entry.state).map_err(to_message)?;

    let transaction = conn.transaction().map_err(to_message)?;

    // A plain delete, so the old entry's values and blobs go with it
    transaction
        .execute("DELETE FROM history WHERE session_id = ?1", params![entry.session_id])
        .map_err(to_message)?;
    transaction
        .execute(
            "INSERT INTO history (session_id, applet_id, tool_name, session_name, deleted_at, state)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![entry.session_id, entry.applet_id, entry.tool_name, entry.session_name, entry.deleted_at, state],
        )
        .map_err(to_message)?;

    for (position, value) in entry.values.iter().enumerate() {
        transaction
            .execute(
                "INSERT OR REPLACE INTO history_value (session_id, source, key, position, kind, text)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    entry.session_id,
                    value.source.as_str(),
                    value.key,
                    position as i64,
                    value.kind.as_str(),
                    value.text,
                ],
            )
            .map_err(to_message)?;
    }

    for (blob_id, data) in blobs {
        transaction
            .execute(
                "INSERT INTO history_blob (session_id, blob_id, data) VALUES (?1, ?2, ?3)",
                params![entry.session_id, blob_id, data],
            )
            .map_err(to_message)?;
    }

    trim(&transaction, head.max_entries)?;
    transaction.commit().map_err(to_message)
}

/// Newest first. With a `query`, only entries whose tool, tab name, inputs or
/// outputs contain it, each with a snippet around the first match in a value.
fn list_entries(conn: &Connection, query: Option<String>, offset: i64, limit: i64) -> Result<HistoryPage, String> {
    let query = query.map(|query| query.trim().to_string()).filter(|query| !query.is_empty());
    let pattern = query.as_deref().map(like_pattern);

    let total: i64 = conn
        .query_row(&format!("SELECT COUNT(*) FROM history {SEARCH_FILTER}"), params![pattern], |row| row.get(0))
        .map_err(to_message)?;

    let mut statement = conn
        .prepare(&format!(
            "SELECT session_id, applet_id, session_name, deleted_at, {SIZE_EXPRESSION}
             FROM history {SEARCH_FILTER}
             ORDER BY deleted_at DESC
             LIMIT ?2 OFFSET ?3"
        ))
        .map_err(to_message)?;

    let mut items = statement
        .query_map(params![pattern, limit, offset], |row| {
            Ok(HistoryEntry {
                session_id: row.get(0)?,
                applet_id: row.get(1)?,
                session_name: row.get(2)?,
                deleted_at: row.get(3)?,
                size: row.get(4)?,
                preview: None,
                search_result_preview: None,
                search_result_field: None,
            })
        })
        .map_err(to_message)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(to_message)?;

    // Only the head of one value per entry, text values first
    let mut preview_statement = conn
        .prepare(
            "SELECT substr(text, 1, ?2), length(text) FROM history_value
             WHERE session_id = ?1 AND text <> ''
             ORDER BY kind = 'text' DESC, position LIMIT 1",
        )
        .map_err(to_message)?;

    // Only the first value that matches, read in full to cut the snippet
    let mut match_statement = conn
        .prepare(
            "SELECT source, key, text FROM history_value
             WHERE session_id = ?1 AND text LIKE ?2 ESCAPE '\\'
             ORDER BY position LIMIT 1",
        )
        .map_err(to_message)?;

    for item in &mut items {
        let head = preview_statement
            .query_row(params![item.session_id, PREVIEW_SOURCE_LENGTH as i64], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
            })
            .optional()
            .map_err(to_message)?;
        item.preview = head.and_then(|(head, length)| make_preview(&head, length as usize <= PREVIEW_SOURCE_LENGTH));

        if let (Some(query), Some(pattern)) = (query.as_deref(), pattern.as_deref()) {
            let matched = match_statement
                .query_row(params![item.session_id, pattern], |row| {
                    Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?))
                })
                .optional()
                .map_err(to_message)?;

            if let Some((source, key, text)) = matched {
                item.search_result_preview = make_snippet(&text, query);
                item.search_result_field = Some(FieldRef { source: FieldSource::parse(&source), key });
            }
        }
    }

    Ok(HistoryPage { items, total })
}

/// The whole applet state, its input and output values put back in
fn read_state(conn: &Connection, session_id: &str) -> Result<Option<Value>, String> {
    let state = conn
        .query_row("SELECT state FROM history WHERE session_id = ?1", params![session_id], |row| {
            row.get::<_, String>(0)
        })
        .optional()
        .map_err(to_message)?;

    let Some(state) = state else {
        return Ok(None);
    };
    let mut state: Value = serde_json::from_str(&state).map_err(to_message)?;

    let mut statement = conn
        .prepare("SELECT source, key, kind, text FROM history_value WHERE session_id = ?1 ORDER BY position")
        .map_err(to_message)?;
    let rows = statement
        .query_map(params![session_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, String>(2)?, row.get::<_, String>(3)?))
        })
        .map_err(to_message)?;

    let mut inputs = Map::new();
    let mut outputs = Map::new();
    for row in rows {
        let (source, key, kind, text) = row.map_err(to_message)?;
        let values = match FieldSource::parse(&source) {
            FieldSource::Input => &mut inputs,
            FieldSource::Output => &mut outputs,
        };
        values.insert(key, to_value(&kind, text));
    }

    if let Value::Object(object) = &mut state {
        object.insert("inputValues".to_string(), Value::Object(inputs));
        object.insert("outputValues".to_string(), Value::Object(outputs));
    }

    Ok(Some(state))
}

/// The given values of a stored tab, in order, without reading the rest.
/// `None` where a field has no value. Binary values come as their placeholders.
fn read_fields(conn: &Connection, session_id: &str, fields: &[HistoryField]) -> Result<Vec<Option<Value>>, String> {
    let mut statement = conn
        .prepare(
            "SELECT kind, CASE WHEN ?4 IS NULL THEN text ELSE substr(text, 1, ?4) END, length(text)
             FROM history_value WHERE session_id = ?1 AND source = ?2 AND key = ?3",
        )
        .map_err(to_message)?;

    fields
        .iter()
        .map(|field| {
            let max_length = field.max_length.map(|length| length as i64);
            let row = statement
                .query_row(params![session_id, field.source.as_str(), field.key, max_length], |row| {
                    Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?, row.get::<_, i64>(2)?))
                })
                .optional()
                .map_err(to_message)?;

            Ok(row.map(|(kind, text, length)| match field.max_length {
                // Cut as text, whatever the kind, for a one-line preview
                Some(max_length) if length as usize > max_length => Value::String(format!("{text}…")),
                Some(_) => Value::String(text),
                None => to_value(&kind, text),
            }))
        })
        .collect()
}

fn read_blob(conn: &Connection, session_id: &str, blob_id: &str) -> Result<Vec<u8>, String> {
    conn.query_row(
        "SELECT data FROM history_blob WHERE session_id = ?1 AND blob_id = ?2",
        params![session_id, blob_id],
        |row| row.get(0),
    )
    .optional()
    .map_err(to_message)?
    .ok_or_else(|| format!("No blob {blob_id} for {session_id}"))
}

/// Saves a closed tab with its values and binary values, then trims the
/// history. The body is raw bytes rather than JSON, see `parse_add_request`.
#[tauri::command]
pub async fn history_add(db: State<'_, HistoryDb>, request: Request<'_>) -> Result<(), String> {
    let InvokeBody::Raw(body) = request.body() else {
        return Err("Expected the history entry as raw bytes".to_string());
    };

    let (head, blobs) = parse_add_request(body)?;
    let mut conn = db.conn()?;
    insert_entry(&mut conn, &head, &blobs)
}

#[tauri::command]
pub async fn history_list(
    db: State<'_, HistoryDb>,
    query: Option<String>,
    offset: i64,
    limit: i64,
) -> Result<HistoryPage, String> {
    let conn = db.conn()?;
    list_entries(&conn, query, offset, limit)
}

/// The stored applet state, with placeholders where its blobs go
#[tauri::command]
pub async fn history_get(db: State<'_, HistoryDb>, session_id: String) -> Result<Option<Value>, String> {
    let conn = db.conn()?;
    read_state(&conn, &session_id)
}

/// One binary value of a stored tab, sent as raw bytes (an ArrayBuffer in JS)
#[tauri::command]
pub async fn history_get_blob(
    db: State<'_, HistoryDb>,
    session_id: String,
    blob_id: String,
) -> Result<Response, String> {
    let conn = db.conn()?;
    read_blob(&conn, &session_id, &blob_id).map(Response::new)
}

#[tauri::command]
pub async fn history_fields(
    db: State<'_, HistoryDb>,
    session_id: String,
    fields: Vec<HistoryField>,
) -> Result<Vec<Option<Value>>, String> {
    let conn = db.conn()?;
    read_fields(&conn, &session_id, &fields)
}

#[tauri::command]
pub async fn history_remove(db: State<'_, HistoryDb>, session_id: String) -> Result<(), String> {
    db.conn()?
        .execute("DELETE FROM history WHERE session_id = ?1", params![session_id])
        .map_err(to_message)?;
    Ok(())
}

#[tauri::command]
pub async fn history_trim(db: State<'_, HistoryDb>, max_entries: i64) -> Result<(), String> {
    let conn = db.conn()?;
    trim(&conn, max_entries)
}

#[tauri::command]
pub async fn history_clear(db: State<'_, HistoryDb>) -> Result<(), String> {
    let conn = db.conn()?;
    trim(&conn, 0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn open() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(SCHEMA).unwrap();
        conn
    }

    /// A `history_add` body as the webview builds it
    fn add_request(session_id: &str, deleted_at: i64, max_entries: i64, values: Value, blobs: &[(&str, &[u8])]) -> Vec<u8> {
        let head = json!({
            "entry": {
                "sessionId": session_id,
                "appletId": "tool",
                "toolName": "JSON Formatter",
                "sessionName": "My Tab",
                "deletedAt": deleted_at,
                "state": { "appletId": "tool", "optionValues": { "indent": 2 } },
                "values": values
            },
            "maxEntries": max_entries,
            "blobs": blobs.iter().map(|(id, data)| json!({ "id": id, "length": data.len() })).collect::<Vec<_>>()
        })
        .to_string();

        let mut body = (head.len() as u32).to_le_bytes().to_vec();
        body.extend_from_slice(head.as_bytes());
        for (_, data) in blobs {
            body.extend_from_slice(data);
        }
        body
    }

    fn add(conn: &mut Connection, session_id: &str, deleted_at: i64, max_entries: i64, values: Value, blobs: &[(&str, &[u8])]) {
        let body = add_request(session_id, deleted_at, max_entries, values, blobs);
        let (head, blobs) = parse_add_request(&body).unwrap();
        insert_entry(conn, &head, &blobs).unwrap();
    }

    fn count(conn: &Connection, table: &str) -> i64 {
        conn.query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| row.get(0)).unwrap()
    }

    fn text_values() -> Value {
        json!([
            { "source": "input", "key": "input", "kind": "text", "text": "{\"name\":\"peranti\"}" },
            { "source": "output", "key": "output", "kind": "text", "text": "{\n  \"name\": \"peranti\"\n}" },
            { "source": "output", "key": "stats", "kind": "json", "text": "[{\"label\":\"Lines\",\"value\":3}]" }
        ])
    }

    #[test]
    fn parses_add_request_and_rejects_malformed_bodies() {
        let body = add_request("s1", 1, 10, json!([]), &[("b1", b"PNG"), ("b2", &[0, 255])]);
        let (head, blobs) = parse_add_request(&body).unwrap();

        assert_eq!(head.entry.session_id, "s1");
        assert_eq!(blobs, vec![("b1".to_string(), &b"PNG"[..]), ("b2".to_string(), &[0u8, 255][..])]);

        assert!(parse_add_request(&body[..body.len() - 1]).is_err());
        assert!(parse_add_request(&[body.as_slice(), b"x"].concat()).is_err());
        assert!(parse_add_request(&[1, 0]).is_err());
    }

    #[test]
    fn stores_each_value_once_and_rebuilds_the_state() {
        let mut conn = open();
        add(&mut conn, "s1", 1, 10, text_values(), &[]);

        // The state column holds no values; they live in `history_value` only
        let stored: String = conn.query_row("SELECT state FROM history", [], |row| row.get(0)).unwrap();
        assert!(!stored.contains("peranti"));
        assert_eq!(count(&conn, "history_value"), 3);

        let state = read_state(&conn, "s1").unwrap().unwrap();
        assert_eq!(state["optionValues"]["indent"], 2);
        assert_eq!(state["inputValues"]["input"], "{\"name\":\"peranti\"}");
        assert_eq!(state["outputValues"]["stats"], json!([{ "label": "Lines", "value": 3 }]));

        assert_eq!(read_state(&conn, "unknown").unwrap(), None);
    }

    #[test]
    fn stores_blobs_and_reads_them_back() {
        let mut conn = open();
        let values = json!([
            { "source": "input", "key": "file", "kind": "json", "text": "{\"$historyBlob\":\"b1\",\"name\":\"logo.png\"}" }
        ]);
        add(&mut conn, "s1", 1, 10, values, &[("b1", b"PNG bytes")]);

        assert_eq!(read_blob(&conn, "s1", "b1").unwrap(), b"PNG bytes");
        assert!(read_blob(&conn, "s1", "missing").is_err());

        let state = read_state(&conn, "s1").unwrap().unwrap();
        assert_eq!(state["inputValues"]["file"]["name"], "logo.png");
    }

    #[test]
    fn values_and_blobs_go_with_their_entry() {
        let mut conn = open();
        let one_value = || json!([{ "source": "input", "key": "a", "kind": "text", "text": "x" }]);
        add(&mut conn, "s1", 1, 10, one_value(), &[("b1", b"one")]);
        add(&mut conn, "s2", 2, 10, one_value(), &[("b1", b"two")]);

        // Saved again: the old values and blobs are replaced, not kept alongside
        add(&mut conn, "s2", 3, 10, one_value(), &[("b2", b"two again")]);
        assert_eq!(count(&conn, "history_value"), 2);
        assert_eq!(count(&conn, "history_blob"), 2);

        // Trimmed past the limit
        add(&mut conn, "s3", 4, 2, one_value(), &[]);
        assert_eq!(count(&conn, "history"), 2);
        assert!(read_blob(&conn, "s1", "b1").is_err());

        trim(&conn, 0).unwrap();
        assert_eq!(count(&conn, "history_value"), 0);
        assert_eq!(count(&conn, "history_blob"), 0);
    }

    #[test]
    fn negative_limit_keeps_every_entry() {
        let mut conn = open();
        let one_value = || json!([{ "source": "input", "key": "a", "kind": "text", "text": "x" }]);
        add(&mut conn, "s1", 1, -1, one_value(), &[]);
        add(&mut conn, "s2", 2, -1, one_value(), &[]);
        add(&mut conn, "s3", 3, -1, one_value(), &[]);
        assert_eq!(count(&conn, "history"), 3);

        trim(&conn, -1).unwrap();
        assert_eq!(count(&conn, "history"), 3);
    }

    #[test]
    fn searches_values_and_names_with_a_snippet_of_the_matched_field() {
        let mut conn = open();
        add(&mut conn, "s1", 1, 10, text_values(), &[]);
        add(&mut conn, "s2", 2, 10, json!([{ "source": "input", "key": "sql", "kind": "text", "text": "select 1" }]), &[]);

        let page = list_entries(&conn, Some("PERANTI".into()), 0, 50).unwrap();
        assert_eq!(page.total, 1);
        assert_eq!(page.items[0].search_result_preview.as_deref(), Some("{\"name\":\"peranti\"}"));
        assert_eq!(page.items[0].search_result_field, Some(FieldRef { source: FieldSource::Input, key: "input".into() }));

        // A match in a later field points at that field
        let page = list_entries(&conn, Some("lines".into()), 0, 50).unwrap();
        assert_eq!(page.items[0].search_result_field, Some(FieldRef { source: FieldSource::Output, key: "stats".into() }));

        // Matched by the tool or tab name only: listed, without a snippet
        let page = list_entries(&conn, Some("formatter".into()), 0, 50).unwrap();
        assert_eq!(page.total, 2);
        assert!(page.items.iter().all(|item| item.search_result_preview.is_none()));

        // Wildcards are literal
        assert_eq!(list_entries(&conn, Some("%".into()), 0, 50).unwrap().total, 0);
    }

    #[test]
    fn lists_with_a_preview_from_the_first_text_value() {
        let mut conn = open();
        let long = "word ".repeat(500);
        add(&mut conn, "s1", 1, 10, json!([
            { "source": "input", "key": "mode", "kind": "json", "text": "true" },
            { "source": "input", "key": "text", "kind": "text", "text": long }
        ]), &[]);
        add(&mut conn, "s2", 2, 10, text_values(), &[]);

        let page = list_entries(&conn, None, 0, 50).unwrap();
        assert_eq!(page.total, 2);
        assert_eq!(page.items[0].preview.as_deref(), Some("{\"name\":\"peranti\"}"));

        let preview = page.items[1].preview.as_deref().unwrap();
        assert!(preview.starts_with("word word"));
        assert!(preview.ends_with('…'));
    }

    #[test]
    fn reads_fields_whole_or_cut() {
        let mut conn = open();
        let long = "x".repeat(5000);
        add(&mut conn, "s1", 1, 10, json!([
            { "source": "input", "key": "text", "kind": "text", "text": long },
            { "source": "output", "key": "stats", "kind": "json", "text": "[{\"label\":\"Lines\",\"value\":3}]" }
        ]), &[]);

        let field = |source, key: &str, max_length| HistoryField { source, key: key.into(), max_length };
        let values = read_fields(&conn, "s1", &[
            field(FieldSource::Input, "text", Some(100)),
            field(FieldSource::Output, "stats", None),
            field(FieldSource::Output, "stats", Some(5)),
            field(FieldSource::Output, "missing", None),
        ])
        .unwrap();

        assert_eq!(values[0], Some(Value::from(format!("{}…", "x".repeat(100)))));
        assert_eq!(values[1], Some(json!([{ "label": "Lines", "value": 3 }])));
        assert_eq!(values[2], Some(Value::from("[{\"la…")));
        assert_eq!(values[3], None);
    }

    #[test]
    fn size_counts_state_values_and_blobs() {
        let mut conn = open();
        add(&mut conn, "s1", 1, 10, json!([{ "source": "input", "key": "a", "kind": "text", "text": "é" }]), &[("b1", &[0; 1000])]);

        let size: i64 = conn
            .query_row(&format!("SELECT {SIZE_EXPRESSION} FROM history WHERE session_id = 's1'"), [], |row| row.get(0))
            .unwrap();
        let state_length: i64 = conn.query_row("SELECT octet_length(state) FROM history", [], |row| row.get(0)).unwrap();

        // "é" is 2 bytes in UTF-8
        assert_eq!(size, state_length + 2 + 1000);
    }

    #[test]
    fn preview_collapses_whitespace_and_marks_cuts() {
        assert_eq!(make_preview("  {\n  \"a\": 1\n}\n", true), Some("{ \"a\": 1 }".to_string()));
        assert_eq!(make_preview(" \n ", true), None);
        assert_eq!(make_preview("short head", false), Some("short head…".to_string()));

        let preview = make_preview(&"日".repeat(500), true).unwrap();
        assert_eq!(preview.chars().count(), PREVIEW_LENGTH + 1);
    }

    #[test]
    fn snippet_keeps_case_marks_cuts_and_respects_char_boundaries() {
        let text = format!("{}Hello World{}", "a".repeat(50), "b".repeat(100));
        let snippet = make_snippet(&text, "hello world").unwrap();
        assert!(snippet.starts_with('…') && snippet.ends_with('…') && snippet.contains("Hello World"));

        let text = format!("{}needle{}", "é".repeat(40), "日本".repeat(60));
        assert!(make_snippet(&text, "NEEDLE").is_some());
    }

    #[test]
    fn find_ignores_ascii_case_only() {
        assert_eq!(find_ignore_ascii_case("ab Hello", "hELLO"), Some(3));
        assert_eq!(find_ignore_ascii_case("日本 Needle", "needle"), Some(7));
        assert_eq!(find_ignore_ascii_case("Éclair", "éclair"), None);
        assert_eq!(find_ignore_ascii_case("short", "longer needle"), None);
    }

    #[test]
    fn like_pattern_escapes_wildcards() {
        assert_eq!(like_pattern("50%_off\\"), "%50\\%\\_off\\\\%");
    }
}
