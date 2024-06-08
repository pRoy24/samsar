export function getHeaders() {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    return;
  }
  return {
    'headers': {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
    }
  }
}