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


export const cleanJsonTheme = (payload) => {

  try {
    return JSON.stringify(JSON.parse(payload));
  } catch (e) {
    return null;
  }
};
