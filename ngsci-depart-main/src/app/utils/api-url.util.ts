import { environment } from '../../environments/environment';

export function getApiBaseUrl(): string {
  const url = environment.apiUrl.trim();
  return url.endsWith('/') ? url : `${url}/`;
}

export function getMatchHubUrl(): string {
  return `${getApiBaseUrl()}matchHub`;
}
