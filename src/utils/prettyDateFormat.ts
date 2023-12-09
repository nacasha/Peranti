export function prettyDateFormat(date: Date) {
  // Array of month names
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]

  // Get date components
  const year = date.getFullYear().toString().substring(2)
  const month = monthNames[date.getMonth()]
  const day = date.getDate().toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")

  // Construct the pretty date string
  const prettyDate = `${year} ${month} ${day} - ${hours}:${minutes}:${seconds}`

  return prettyDate
}
