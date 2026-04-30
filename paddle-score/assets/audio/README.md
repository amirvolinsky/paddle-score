# Custom announcement audio (Hebrew)

Replace each `.m4a` file in this folder with **your own recording** of the phrase below. Keep the **exact filename** so the app can find it.

**Format:** M4A (AAC), mono or stereo, clear speech, minimal background noise.

The app chains clips and uses **text-to-speech only for player names** (e.g. "אמיר ודור").

## Score points (4 clips)

| File | Say (Hebrew) |
|------|----------------|
| `efes.m4a` | אפס |
| `hamesh_esre.m4a` | חמש עשרה |
| `shloshim.m4a` | שלושים |
| `arbaim.m4a` | ארבעים |

## Game counts 1–7 (7 clips; zero uses `efes.m4a`)

| File | Say |
|------|-----|
| `achat.m4a` | אחת |
| `shtaim.m4a` | שתיים |
| `shalosh.m4a` | שלוש |
| `arba.m4a` | ארבע |
| `hamesh.m4a` | חמש |
| `shesh.m4a` | שש |
| `sheva.m4a` | שבע |

## Match phrases (9 clips)

| File | Say |
|------|-----|
| `dius.m4a` | דיוס |
| `yitron.m4a` | יתרון |
| `giim.m4a` | גיים |
| `set.m4a` | סט |
| `umatch.m4a` | ומאצ׳ |
| `lekol.m4a` | לכול |
| `le.m4a` | ל (short connector before a name) |
| `servim_shel.m4a` | סרבים של |
| `setim.m4a` | סטים |

**Total: 20 files** (`efes` … `setim` as listed above; `efes` is reused for zero games/sets and "אפס אפס" at new game).

After replacing files, rebuild the app (or restart Metro with `--clear`) so bundles pick up changes.
