document.body.innerHTML = import.meta.env.VITE_APP_COLOR
document.body.innerHTML = import.meta.env.VITE_APP_TITLE
document.body.innerHTML = import.meta.env.VITE_EXCLUDE_VALUE
document.body.innerHTML = (import.meta.env.DEV && import.meta.env.VITE_OPEN_PROXY === 'true')
  ? '/proxy/'
  : import.meta.env.VITE_BASE_URL
