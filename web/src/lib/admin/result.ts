/** What every admin Server Action returns: never throws to the browser */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const SAVE_FAILED = "Couldn't save — please try again.";
export const NOT_ADMIN = "Your login has expired or this account isn't an admin. Please log in again.";
