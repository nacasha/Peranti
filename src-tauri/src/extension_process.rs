//! Runs executable extensions: any binary (node, python3, bash, a compiled
//! tool, ...) started inside the extension folder. The input values are
//! written to stdin as JSON and stdout is returned for the frontend to parse.

use std::io::{Read, Write};
use std::process::{Command, Stdio};
use std::thread;
use std::time::{Duration, Instant};

const DEFAULT_TIMEOUT_MS: u64 = 30_000;

/// How often a running process is checked for exit or timeout
const POLL_INTERVAL: Duration = Duration::from_millis(10);

/// PATH of the user's login shell. An app opened from Finder only gets a
/// minimal PATH, so tools installed with Homebrew, nvm, pyenv, ... wouldn't
/// be found without it.
#[cfg(unix)]
fn login_shell_path() -> Option<&'static str> {
    use std::sync::OnceLock;

    static PATH: OnceLock<Option<String>> = OnceLock::new();

    PATH.get_or_init(|| {
        let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/sh".into());
        let output = Command::new(shell)
            .args(["-lc", "printf %s \"$PATH\""])
            .stdin(Stdio::null())
            .stderr(Stdio::null())
            .output()
            .ok()?;

        let path = String::from_utf8(output.stdout).ok()?;
        (output.status.success() && !path.is_empty()).then_some(path)
    })
    .as_deref()
}

#[cfg(not(unix))]
fn login_shell_path() -> Option<&'static str> {
    None
}

fn run(
    cwd: String,
    command: String,
    args: Vec<String>,
    input: String,
    timeout_ms: u64,
) -> Result<String, String> {
    let mut process = Command::new(&command);
    process
        .args(&args)
        .current_dir(&cwd)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    if let Some(path) = login_shell_path() {
        process.env("PATH", path);
    }

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        process.creation_flags(CREATE_NO_WINDOW);
    }

    let mut child = process
        .spawn()
        .map_err(|error| format!("Failed to start \"{command}\": {error}"))?;

    // Feed stdin and drain both pipes on their own threads, so a process
    // writing a lot of output can't block on a full pipe
    let mut stdin = child.stdin.take().ok_or("Failed to open stdin")?;
    let stdin_thread = thread::spawn(move || {
        // A process that exits without reading its input closes the pipe,
        // which is not an error worth reporting
        let _ = stdin.write_all(input.as_bytes());
    });

    let mut stdout = child.stdout.take().ok_or("Failed to open stdout")?;
    let stdout_thread = thread::spawn(move || {
        let mut buffer = String::new();
        let _ = stdout.read_to_string(&mut buffer);
        buffer
    });

    let mut stderr = child.stderr.take().ok_or("Failed to open stderr")?;
    let stderr_thread = thread::spawn(move || {
        let mut buffer = String::new();
        let _ = stderr.read_to_string(&mut buffer);
        buffer
    });

    let deadline = Instant::now() + Duration::from_millis(timeout_ms);
    let status = loop {
        if let Some(status) = child.try_wait().map_err(|error| error.to_string())? {
            break status;
        }

        if Instant::now() >= deadline {
            let _ = child.kill();
            let _ = child.wait();
            return Err(format!("Timed out after {}s", timeout_ms as f64 / 1000.0));
        }

        thread::sleep(POLL_INTERVAL);
    };

    let _ = stdin_thread.join();
    let stdout = stdout_thread.join().unwrap_or_default();
    let stderr = stderr_thread.join().unwrap_or_default();

    if status.success() {
        Ok(stdout)
    } else {
        let stderr = stderr.trim();
        Err(if stderr.is_empty() {
            format!("\"{command}\" exited with {status}")
        } else {
            stderr.to_string()
        })
    }
}

#[tauri::command]
pub async fn run_extension_process(
    cwd: String,
    command: String,
    args: Vec<String>,
    input: String,
    timeout_ms: Option<u64>,
) -> Result<String, String> {
    let timeout_ms = timeout_ms.unwrap_or(DEFAULT_TIMEOUT_MS);

    tauri::async_runtime::spawn_blocking(move || run(cwd, command, args, input, timeout_ms))
        .await
        .map_err(|error| error.to_string())?
}
