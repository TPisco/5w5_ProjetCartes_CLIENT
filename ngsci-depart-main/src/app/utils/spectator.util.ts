import { ActivatedRouteSnapshot } from '@angular/router';

const WATCH_FLAG = 'watchAsSpectator';
const SPECTATOR_KEY = 'spectatorKey';

export function isWatchAsSpectator(route?: ActivatedRouteSnapshot | null): boolean {
  if (route?.queryParamMap.get('mode') === 'spectator') {
    return true;
  }
  return sessionStorage.getItem(WATCH_FLAG) === 'true';
}

export function enableWatchAsSpectator(): void {
  sessionStorage.setItem(WATCH_FLAG, 'true');
}

export function disableWatchAsSpectator(): void {
  sessionStorage.removeItem(WATCH_FLAG);
  sessionStorage.removeItem(SPECTATOR_KEY);
}

export function setSpectatorKey(key: string): void {
  sessionStorage.setItem(SPECTATOR_KEY, key);
}

export function getSpectatorKey(): string {
  return sessionStorage.getItem(SPECTATOR_KEY) ?? '';
}

export function clearSpectatorSession(): void {
  disableWatchAsSpectator();
  sessionStorage.removeItem('matchData');
}
