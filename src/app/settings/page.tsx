"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { useSettings } from "@/lib/settings-context";
import { useAppAudio } from "@/lib/audio-context";
import { useAuth } from "@/lib/auth-context";
import {
  THEMES,
  MUSIC_TRACKS,
  KEY_SOUNDS,
  PREMIUM_BACKGROUNDS,
  type Preferences,
} from "@/lib/preferences";

const TABS = [
  { id: "appearance", label: "Ko‘rinish", icon: "palette" },
  { id: "audio", label: "Musiqa va tovush", icon: "headphones" },
  { id: "practice", label: "Yozish sozlamalari", icon: "keyboard" },
  { id: "background", label: "Shaxsiy fon", icon: "image" },
] as const;
function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`setting-switch ${checked ? "checked" : ""}`}
      >
        <span />
      </button>
    </div>
  );
}
function Slider({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  unit = "%",
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  unit?: string;
}) {
  return (
    <label className="setting-slider">
      <span>
        {label}
        <output>
          {value}
          {unit}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
function Choices({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (v: string | number) => void;
}) {
  return (
    <div className="setting-row">
      <strong>{label}</strong>
      <div className="settings-choices" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            aria-pressed={value === o.value}
            className={value === o.value ? "selected" : ""}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    resetSettings,
    storageAvailable,
    background,
    uploadBackground,
    removeBackground,
  } = useSettings();
  const { user, loginUrl, loading } = useAuth();
  const audio = useAppAudio();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("appearance");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [undo, setUndo] = useState<Preferences | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const theme = THEMES.find((t) => t.id === settings.theme)!;
  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      await uploadBackground(file);
      setMessage("Rasm tayyor. Shaxsiy foningiz saqlandi.");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Rasm saqlanmadi.",
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }
  function reset() {
    setUndo({ ...settings });
    audio.stop();
    resetSettings();
    setMessage("Sozlamalar standart holatga qaytarildi.");
  }
  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <span className="eyebrow">SIZGA MOS MAYDON</span>
          <h1>
            Sozlamalar<span>.</span>
          </h1>
          <p>O‘z ritmingizni toping. Har bir detalni o‘zingizga moslang.</p>
        </div>
        <div
          className={`settings-saved ${!storageAvailable ? "storage-error" : ""}`}
        >
          <Icon name={storageAvailable ? "check" : "help"} size={15} />
          {storageAvailable
            ? "Avtomatik saqlanadi"
            : "Faqat shu sessiyada saqlanadi"}
        </div>
      </div>
      <div className="settings-layout">
        <aside className="settings-menu">
          <nav aria-label="Sozlamalar bo‘limlari">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={tab === t.id ? "active" : ""}
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
              >
                <Icon name={t.icon} size={18} />
                {t.label}
                <Icon name="chevron" size={13} />
              </button>
            ))}
          </nav>
          <div className="settings-menu-note">
            <Icon name="shield" size={18} />
            <p>
              Tanlovlaringiz shu brauzerda saqlanadi. Mashqni istalgan vaqtda
              davom ettiring.
            </p>
          </div>
          <Link className="settings-return" href="/">
            Yozish maydoniga
            <Icon name="arrow" size={16} />
          </Link>
          <button className="settings-reset" onClick={reset}>
            <Icon name="reset" size={14} />
            Standartga qaytarish
          </button>
        </aside>
        <div className="settings-content">
          {message && (
            <div className="settings-notice" role="status">
              <Icon name="check" size={16} />
              <span>{message}</span>
              {undo && (
                <button
                  onClick={() => {
                    updateSettings(undo);
                    setUndo(null);
                    setMessage("Avvalgi sozlamalar tiklandi.");
                  }}
                >
                  Bekor qilish
                </button>
              )}
              <button
                aria-label="Xabarni yopish"
                onClick={() => {
                  setMessage("");
                  setUndo(null);
                }}
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          )}
          {tab === "appearance" && (
            <>
              <section className="settings-section">
                <div className="settings-section-title">
                  <span className="settings-section-icon">
                    <Icon name="palette" />
                  </span>
                  <div>
                    <h2>Qaysi kayfiyatda yozamiz?</h2>
                    <p>
                      6 ta tema. Tanlang — yozish maydoni darhol moslashadi.
                    </p>
                  </div>
                </div>
                <div className="theme-grid">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-choice ${settings.theme === t.id && settings.backgroundEffect === "none" && !settings.customBackground ? "selected" : ""}`}
                      aria-label={`${t.name} temasini tanlash`}
                      aria-pressed={
                        settings.theme === t.id &&
                        settings.backgroundEffect === "none" &&
                        !settings.customBackground
                      }
                      onClick={() =>
                        updateSettings({
                          theme: t.id,
                          backgroundEffect: "none",
                          customBackground: false,
                        })
                      }
                    >
                      <span
                        className="theme-swatch"
                        style={{
                          background: t.background,
                          color: t.foreground,
                        }}
                      >
                        <span className="swatch-brand">y.</span>
                        <span className="swatch-dots">•••</span>
                        <span className="swatch-word">
                          yoz<span style={{ color: t.accent }}>|</span>aver
                        </span>
                        {settings.theme === t.id &&
                          settings.backgroundEffect === "none" &&
                          !settings.customBackground && (
                            <span className="theme-check">
                              <Icon name="check" size={12} />
                            </span>
                          )}
                      </span>
                      <strong>{t.name}</strong>
                      <span>{t.description}</span>
                    </button>
                  ))}
                </div>
              </section>
              <section className="settings-section">
                <div className="settings-section-title">
                  <span className="settings-section-icon">
                    <Icon name="sparkles" />
                  </span>
                  <div>
                    <h2>Maydoningizga yangi o‘lcham</h2>
                    <p>
                      {PREMIUM_BACKGROUNDS.length} ta animatsiyali fon. Har
                      birida o‘ziga xos muhit va harakat.
                    </p>
                  </div>
                  <span className="premium-label">PREMIUM FONLAR</span>
                </div>
                <div className="premium-grid">
                  {PREMIUM_BACKGROUNDS.map((b) => (
                    <button
                      key={b.id}
                      className={`premium-choice ${settings.backgroundEffect === b.id && !settings.customBackground ? "selected" : ""}`}
                      aria-label={`${b.name} animatsiyali fonini tanlash`}
                      aria-pressed={
                        settings.backgroundEffect === b.id &&
                        !settings.customBackground
                      }
                      onClick={() =>
                        updateSettings({
                          backgroundEffect: b.id,
                          theme: b.theme,
                          customBackground: false,
                        })
                      }
                    >
                      <span
                        className={`premium-swatch swatch-${b.id}`}
                        aria-hidden="true"
                      >
                        <i />
                        <i />
                        <i />
                        <span>y.</span>
                        <small>
                          {"badge" in b
                            ? b.badge
                            : b.id === "orbit" ||
                                b.id === "prism" ||
                                b.id === "stars"
                              ? "3D"
                              : "LIVE"}
                        </small>
                      </span>
                      <span className="premium-caption">
                        <strong>{b.name}</strong>
                        <Icon
                          name={
                            settings.backgroundEffect === b.id &&
                            !settings.customBackground
                              ? "check"
                              : "arrow"
                          }
                          size={15}
                        />
                      </span>
                      <span className="premium-description">
                        {b.description}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="premium-note">
                  Animatsiyalarni kamaytirish yoqilsa, fon sokin ko‘rinishda
                  qoladi.
                </p>
              </section>
              <section className="settings-section">
                <div className="settings-section-title">
                  <span className="settings-section-icon">
                    <Icon name="keyboard" />
                  </span>
                  <div>
                    <h2>Harflar ham sizga mos bo‘lsin</h2>
                    <p>O‘qish qulayligi va matnning harakatini sozlang.</p>
                  </div>
                </div>
                <div
                  className="settings-live-preview"
                  style={{
                    background: theme.background,
                    color: theme.foreground,
                    fontFamily:
                      settings.fontFamily === "mono"
                        ? "var(--font-geist-mono)"
                        : "var(--font-geist-sans)",
                  }}
                >
                  <span className="preview-caption">JONLI KO‘RINISH</span>
                  <span style={{ fontSize: `${settings.fontSize * 0.7}px` }}>
                    fikringiz <i style={{ background: theme.accent }} />
                    tezligida yozing
                  </span>
                  <span className="preview-caption">
                    {theme.name} ·{" "}
                    {settings.fontFamily === "mono" ? "Monospace" : "Geist"}
                  </span>
                </div>
                <Choices
                  label="Shrift"
                  value={settings.fontFamily}
                  options={[
                    { value: "sans", label: "Geist" },
                    { value: "mono", label: "Monospace" },
                  ]}
                  onChange={(v) =>
                    updateSettings({
                      fontFamily: v as Preferences["fontFamily"],
                    })
                  }
                />
                <Choices
                  label="Harf kattaligi"
                  value={settings.fontSize}
                  options={[
                    { value: 32, label: "Kichik" },
                    { value: 40, label: "O‘rtacha" },
                    { value: 48, label: "Katta" },
                  ]}
                  onChange={(v) =>
                    updateSettings({ fontSize: v as Preferences["fontSize"] })
                  }
                />
                <Choices
                  label="Kursor ko‘rinishi"
                  value={settings.caret}
                  options={[
                    { value: "line", label: "│ Chiziq" },
                    { value: "block", label: "▌Blok" },
                    { value: "underline", label: "_ Tagchiziq" },
                  ]}
                  onChange={(v) =>
                    updateSettings({ caret: v as Preferences["caret"] })
                  }
                />
                <Toggle
                  label="Matnning silliq siljishi"
                  description="Harflar yozganingiz sari yumshoq harakatlanadi."
                  checked={settings.smoothText}
                  onChange={(v) => updateSettings({ smoothText: v })}
                />
                <Toggle
                  label="Animatsiyalarni kamaytirish"
                  description="Tinchroq ko‘rinish va kamroq harakat."
                  checked={settings.reduceMotion}
                  onChange={(v) => updateSettings({ reduceMotion: v })}
                />
              </section>
            </>
          )}
          {tab === "audio" && (
            <>
              <section className="settings-section">
                <div className="settings-section-title">
                  <span className="settings-section-icon">
                    <Icon name="headphones" />
                  </span>
                  <div>
                    <h2>Diqqat uchun ohang</h2>
                    <p>Avval 12 soniya eshitib ko‘ring. Yoqsa, tanlang.</p>
                  </div>
                  {audio.playing && (
                    <button className="settings-stop" onClick={audio.stop}>
                      <Icon name="close" size={14} />
                      To‘xtatish
                    </button>
                  )}
                </div>
                <Slider
                  label="Musiqa balandligi"
                  value={Math.round(settings.musicVolume * 100)}
                  onChange={(v) => audio.setVolume(v / 100)}
                />
                <div className="sound-grid">
                  {MUSIC_TRACKS.map((track) => (
                    <article
                      className={`sound-card ${settings.musicTrack === track.id ? "selected" : ""}`}
                      key={track.id}
                    >
                      <div className="sound-card-top">
                        <span className="track-icon">
                          <Icon name={track.icon} size={20} />
                        </span>
                        <span>
                          {settings.musicTrack === track.id ? (
                            <span className="selection-badge">
                              <Icon name="check" size={11} />
                              Tanlangan
                            </span>
                          ) : (
                            <span className="track-type">FON MUSIQASI</span>
                          )}
                        </span>
                      </div>
                      <h3>{track.name}</h3>
                      <p>{track.description}</p>
                      <div className="audio-wave" aria-hidden="true">
                        {[
                          8, 14, 9, 22, 17, 28, 13, 20, 10, 25, 17, 9, 20, 13,
                          24, 10, 17, 7,
                        ].map((h, i) => (
                          <i
                            key={i}
                            style={{
                              height: h,
                              animationDelay: `${i * 0.08}s`,
                            }}
                            className={
                              audio.activeTrack === track.id && audio.playing
                                ? "wave-playing"
                                : ""
                            }
                          />
                        ))}
                      </div>
                      <div className="sound-card-actions">
                        <button
                          aria-label={`${track.name} musiqasini eshitish`}
                          onClick={() => audio.previewMusic(track.id)}
                          className={
                            audio.previewTrack === track.id
                              ? "preview-playing"
                              : ""
                          }
                        >
                          <Icon
                            name={
                              audio.previewTrack === track.id ? "close" : "play"
                            }
                            size={13}
                          />
                          {audio.previewTrack === track.id
                            ? "To‘xtatish"
                            : "Eshitish"}
                        </button>
                        <button
                          aria-label={`${track.name} musiqasini tanlash`}
                          aria-pressed={settings.musicTrack === track.id}
                          onClick={() => audio.selectMusic(track.id)}
                        >
                          Tanlash
                          <Icon name="check" size={13} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {audio.error && (
                  <p role="alert" className="settings-error">
                    {audio.error}
                  </p>
                )}
              </section>
              <section className="settings-section">
                <div className="settings-section-title">
                  <span className="settings-section-icon">
                    <Icon name="keyboard" />
                  </span>
                  <div>
                    <h2>Har bir tugmaning o‘z tovushi</h2>
                    <p>Eshitib ko‘ring, so‘ng yoqqanini o‘rnating.</p>
                  </div>
                </div>
                <Toggle
                  label="Tugma tovushi"
                  description="Yozayotganingizda tanlangan tovush ijro etiladi."
                  checked={settings.keySoundEnabled}
                  onChange={(v) => updateSettings({ keySoundEnabled: v })}
                />
                <Slider
                  label="Tugma tovushi balandligi"
                  value={Math.round(settings.keyVolume * 100)}
                  onChange={(v) => updateSettings({ keyVolume: v / 100 })}
                />
                <div className="key-sound-grid">
                  {KEY_SOUNDS.map((sound) => (
                    <article
                      className={`key-sound-card ${settings.keySound === sound.id ? "selected" : ""}`}
                      key={sound.id}
                    >
                      <span className={`sample-key key-${sound.id}`}>A</span>
                      <div>
                        <h3>{sound.name}</h3>
                        <p>{sound.description}</p>
                      </div>
                      <div>
                        <button
                          aria-label={`${sound.name} tovushini eshitish`}
                          title="Eshitish"
                          onClick={() => audio.previewKey(sound.id)}
                        >
                          <Icon name="volume" size={16} />
                        </button>
                        <button
                          aria-label={`${sound.name} tovushini o‘rnatish`}
                          aria-pressed={settings.keySound === sound.id}
                          title="O‘rnatish"
                          onClick={() => {
                            updateSettings({
                              keySound: sound.id,
                              keySoundEnabled: true,
                            });
                            audio.previewKey(sound.id);
                          }}
                        >
                          <Icon
                            name={
                              settings.keySound === sound.id ? "check" : "arrow"
                            }
                            size={15}
                          />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <label className="sound-test-input">
                  <span>Tanlangan tovushni sinab ko‘ring</span>
                  <input
                    placeholder="Shu yerga yozib ko‘ring…"
                    aria-label="Tugma tovushini sinash"
                    onKeyDown={(e) => {
                      if (e.key.length === 1 || e.key === "Backspace")
                        audio.previewKey(settings.keySound);
                    }}
                  />
                </label>
                {audio.soundError && (
                  <p className="settings-error" role="alert">
                    {audio.soundError}
                  </p>
                )}
              </section>
            </>
          )}
          {tab === "practice" && (
            <section className="settings-section">
              <div className="settings-section-title">
                <span className="settings-section-icon">
                  <Icon name="keyboard" />
                </span>
                <div>
                  <h2>Sizga mos mashq</h2>
                  <p>Yangi mashqlar shu tanlovlar bilan boshlanadi.</p>
                </div>
              </div>
              <Choices
                label="Asosiy til"
                value={settings.language}
                options={[
                  { value: "uz", label: "O‘zbekcha" },
                  { value: "en", label: "English" },
                ]}
                onChange={(v) =>
                  updateSettings({ language: v as Preferences["language"] })
                }
              />
              <Choices
                label="Test turi"
                value={settings.mode}
                options={[
                  { value: "time", label: "Vaqt" },
                  { value: "words", label: "So‘zlar" },
                ]}
                onChange={(v) =>
                  updateSettings({ mode: v as Preferences["mode"] })
                }
              />
              <Choices
                label="Test davomiyligi"
                value={settings.timeLimit}
                options={[15, 30, 60, 120].map((n) => ({
                  value: n,
                  label: `${n}s`,
                }))}
                onChange={(v) =>
                  updateSettings({ timeLimit: v as Preferences["timeLimit"] })
                }
              />
              <Choices
                label="So‘zlar soni"
                value={settings.wordCount}
                options={[10, 25, 50, 100].map((n) => ({
                  value: n,
                  label: `${n}`,
                }))}
                onChange={(v) =>
                  updateSettings({ wordCount: v as Preferences["wordCount"] })
                }
              />
              <Toggle
                label="Virtual klaviatura"
                description="Keyingi harf uchun kerakli tugmani ko‘rsatadi."
                checked={settings.showKeyboard}
                onChange={(v) => updateSettings({ showKeyboard: v })}
              />
              <Toggle
                label="Jonli statistika"
                description="Mashq paytida vaqt, tezlik va aniqlikni ko‘rsating."
                checked={settings.showStats}
                onChange={(v) => updateSettings({ showStats: v })}
              />
              <Toggle
                label="Tugmalar eslatmasi"
                description="Space va Esc bo‘yicha eslatmalar pastda ko‘rinadi."
                checked={settings.showShortcuts}
                onChange={(v) => updateSettings({ showShortcuts: v })}
              />
              <Toggle
                label="Diqqat rejimida boshlash"
                description="Navigatsiya va boshqaruvlar xiralashadi. Esc bilan chiqiladi."
                checked={settings.focusMode}
                onChange={(v) => updateSettings({ focusMode: v })}
              />
              <div className="settings-info">
                <Icon name="help" size={17} />
                <p>
                  Sozlamalar keyingi mashqqa qo‘llanadi. WPM hisoblash va
                  natijalar o‘zgarmaydi.
                </p>
              </div>
            </section>
          )}
          {tab === "background" && (
            <section className="settings-section">
              <div className="settings-section-title">
                <span className="settings-section-icon">
                  <Icon name="image" />
                </span>
                <div>
                  <h2>Sizning rasmingiz. Sizning maydoningiz.</h2>
                  <p>Galereyangizdan sevimli manzara yoki rasmni tanlang.</p>
                </div>
                <span className="member-badge">
                  <Icon name="user" size={12} />
                  Hisob egalari uchun
                </span>
              </div>
              {loading ? (
                <p className="muted">Hisob tekshirilmoqda…</p>
              ) : !user ? (
                <div className="background-signin">
                  <div className="background-sample">
                    <Icon name="image" size={42} />
                  </div>
                  <h3>Shaxsiy fon uchun hisobga kiring</h3>
                  <p>
                    Rasmingiz shu qurilmada hisobingizga bog‘lab saqlanadi.
                    Boshqa hisobda va hisobdan chiqqaningizda ko‘rinmaydi.
                  </p>
                  <a className="primary-button" href={loginUrl}>
                    Google orqali kirish
                    <Icon name="arrow" size={16} />
                  </a>
                </div>
              ) : (
                <>
                  <input
                    ref={fileRef}
                    className="sr-only"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    aria-label="Galereyadan fon rasmini tanlash"
                    disabled={uploading}
                    onChange={(e) => void upload(e.target.files?.[0])}
                  />
                  {background ? (
                    <div
                      className="uploaded-preview"
                      style={{ backgroundImage: `url("${background.url}")` }}
                    >
                      <div
                        style={{
                          background: `rgba(9,17,35,${settings.backgroundDim})`,
                          backdropFilter: `blur(${settings.backgroundBlur}px)`,
                        }}
                      >
                        <span>JONLI KO‘RINISH</span>
                        <strong>shunchaki yozaver.</strong>
                        <span>
                          {background.name} ·{" "}
                          {Math.round(background.size / 1024)} KB
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="image-upload-area"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                    >
                      <span>
                        <Icon name="upload" size={28} />
                      </span>
                      <strong>
                        {uploading
                          ? "Rasm tayyorlanmoqda…"
                          : "Galereyadan rasm tanlang"}
                      </strong>
                      <span>JPG, PNG, WebP, AVIF, GIF · 10 MB gacha</span>
                    </button>
                  )}
                  <div className="background-actions">
                    <button
                      className="secondary-button"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Icon name="image" size={15} />
                      {uploading
                        ? "Tayyorlanmoqda…"
                        : background
                          ? "Rasmni almashtirish"
                          : "Rasm tanlash"}
                    </button>
                    {background && (
                      <button
                        className="delete-background"
                        disabled={uploading}
                        onClick={() => {
                          setUploadError("");
                          void removeBackground()
                            .then(() => setMessage("Shaxsiy fon o‘chirildi."))
                            .catch((e) => setUploadError(e.message));
                        }}
                      >
                        Rasmni o‘chirish
                      </button>
                    )}
                  </div>
                  {uploadError && (
                    <p role="alert" className="settings-error">
                      {uploadError}
                    </p>
                  )}
                  {background && (
                    <>
                      <Toggle
                        label="Shaxsiy fonni ishlatish"
                        description="Rasmingiz yozish maydonining orqasida ko‘rinadi."
                        checked={settings.customBackground}
                        onChange={(v) =>
                          updateSettings({ customBackground: v })
                        }
                      />
                      <Slider
                        label="Fonning xiraligi"
                        min={20}
                        max={85}
                        value={Math.round(settings.backgroundDim * 100)}
                        onChange={(v) =>
                          updateSettings({ backgroundDim: v / 100 })
                        }
                      />
                      <Slider
                        label="Fonning yumshoqligi"
                        min={0}
                        max={12}
                        unit=" px"
                        value={settings.backgroundBlur}
                        onChange={(v) => updateSettings({ backgroundBlur: v })}
                      />
                    </>
                  )}
                  <div className="settings-info">
                    <Icon name="shield" size={17} />
                    <p>
                      Rasm avtomatik optimallashtiriladi va faqat shu qurilmada
                      saqlanadi. Uni boshqa qurilmada alohida tanlashingiz
                      mumkin.
                    </p>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
