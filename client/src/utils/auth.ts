export const ensureLoggedIn = (callback: () => void): void => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('no token in localstorage');
    }
    const payload = parseJwt(token);
    if (!payload.exp) {
      throw new Error('token does not have expiration timestamp');
    }
    if (payload.exp < new Date().getTime() / 1000) {
      throw new Error('token is expired');
    }
  } catch (error) {
    localStorage.removeItem('token');
    console.error(error);
    callback();
  }
}

export const ensureLoggedOut = (callback: () => void): void => {
  // inverse ensureLoggedIn
  const token = localStorage.getItem('token');
  if (token) {
    callback();
  }
}

const parseJwt = (token: string): any => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};