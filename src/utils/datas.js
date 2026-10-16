export function toMillis(value) {
  if (!value) return 0;

  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  if (typeof value.seconds === 'number') {
    return value.seconds * 1000;
  }

  if (typeof value === 'number') {
    return value < 10000000000 ? value * 1000 : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    const brDate = trimmed.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/
    );

    if (brDate) {
      const [
        ,
        day,
        month,
        year,
        hour = '0',
        minute = '0',
      ] = brDate;

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute)
      ).getTime();
    }

    const parsed = Date.parse(trimmed);

    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatDate(value) {
  const millis = toMillis(value);

  if (!millis) return '';

  const date = new Date(millis);

  return `${pad(date.getDate())}/${pad(
    date.getMonth() + 1
  )}/${date.getFullYear()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}


export function getDateMillis(value) {
  if (!value) return 0;

  if (
    typeof value.toMillis ===
    'function'
  ) {
    return value.toMillis();
  }

  if (
    typeof value.toDate ===
    'function'
  ) {
    return value.toDate().getTime();
  }

  if (
    typeof value.seconds ===
    'number'
  ) {
    return value.seconds * 1000;
  }

  if (typeof value === 'number') {
    return value;
  }

  return 0;
}

export function formatPublicationDate(value) {
  const millis = getDateMillis(value);

  if (!millis) return '';

  const date = new Date(millis);

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const year = date.getFullYear();

  const hour = String(
    date.getHours()
  ).padStart(2, '0');

  const minute = String(
    date.getMinutes()
  ).padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

