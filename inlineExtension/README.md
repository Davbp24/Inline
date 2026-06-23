# Inline Extension

Inline is a browser extension for user-triggered page annotation, capture, rewrite, and workspace sync.

## Runtime Modes

Guest/local mode:

- Users can open the dock without an account.
- Highlights, sticky notes, drawings, handwriting, stamps, AI edits, and page annotation records save to browser storage.
- Local annotation records and retry queues are encrypted at rest with AES-GCM before they are written.
- Guest AI is limited to 10 prompts on the device.
- Success copy should say `Saved to browser.`

Signed-in/synced mode:

- The dashboard syncs the active account, profile, workspace id, and API bases through the external message handoff.
- Captures can sync to the workspace backend and database.
- AI is unlocked for signed-in workspace use.
- Success copy should say `Saved to Workspace` with a dashboard action.

## Privacy And Secure Handling Checklist

- Publish `/privacy` as the privacy policy URL for the extension listing.
- Keep the in-product first-run disclosure enabled before users can start capture or AI actions.
- Use HTTPS or WSS for every non-local synced workspace and AI request.
- Localhost HTTP is allowed only for development on the same machine.
- Do not store provider API keys in the extension bundle, browser storage, or extension messages.
- Do not use user data for personalized, retargeted, or interest-based advertising.
- Do not sell user data.
- Do not allow humans to read user content except with user consent for support, for security investigation, to comply with law, or as aggregated and anonymized internal operations.

## Manifest Permissions

- `storage`: saves preferences, local guest captures, encrypted annotation records, encrypted retry queues, and the guest AI prompt counter.
- `activeTab`: captures the visible tab after a user-triggered screenshot or crop action.
- `contextMenus`: exposes user-triggered page and selection actions.
- `alarms`: retries pending signed-in sync jobs without a constant background loop.
- `content_scripts` on pages: renders the dock and user-facing annotation tools on pages the user visits.
- `host_permissions` for localhost: allows the extension to reach the local web app and backend in development. Production builds should replace localhost entries with the exact deployed HTTPS origins.

## Development

```bash
npm install
npm run build
```

Load `dist/` as an unpacked extension after building.
