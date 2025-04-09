// Source https://emailregex.com/
export const validateEmail = (email: string | undefined | null): boolean =>
  !!email &&
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email,
  );

export const validateTel = (tel: string | undefined | null): boolean =>
  !!tel && tel.length >= 3 && /^[^a-z]*$/gi.test(tel);
