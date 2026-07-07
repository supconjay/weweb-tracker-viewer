<template>
  <div class="pp-root" :class="themeClass" :style="rootStyle">
    <div class="pp-card">
      <!-- Header + dropdown selector -->
      <div class="pp-head">
        <span class="pp-head__label">{{ content.title }}</span>
        <div class="pp-select" :class="{ 'pp-select--open': open }">
          <button type="button" class="pp-select__btn" @click="toggleOpen">
            <span class="pp-select__value" :class="{ 'pp-select__value--ph': !selectedTracker }">
              {{ selectedTracker ? optionLabel(selectedTracker) : content.placeholder }}
            </span>
            <svg class="pp-svg pp-select__chev" v-bind="svgAttrs"><path :d="ic('chevron-down')"></path></svg>
          </button>
          <button
            v-if="content.showRecordLink !== false && selectedTracker"
            type="button"
            class="pp-select__link"
            :title="content.recordLinkLabel"
            @click="emitOpenRecord"
          >
            <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('link')"></path></svg>
          </button>

          <template v-if="open">
            <div class="pp-select__backdrop" @click="open = false"></div>
            <div class="pp-select__menu">
              <div v-if="content.searchable !== false" class="pp-select__search">
                <input
                  ref="search"
                  v-model="search"
                  type="text"
                  placeholder="Search"
                  @click.stop
                />
              </div>
              <ul class="pp-select__list">
                <li v-if="!filteredTrackers.length" class="pp-select__empty">No results</li>
                <li
                  v-for="(t, i) in filteredTrackers"
                  :key="trackerId(t) || i"
                  class="pp-select__opt"
                  :class="{ 'pp-select__opt--active': selectedTracker && trackerId(t) === trackerId(selectedTracker) }"
                  @click="choose(t)"
                >
                  <span>{{ optionLabel(t) }}</span>
                  <svg v-if="selectedTracker && trackerId(t) === trackerId(selectedTracker)" class="pp-svg pp-select__check" v-bind="svgAttrs"><path :d="ic('check')"></path></svg>
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>

      <!-- Empty state when nothing selected -->
      <div v-if="!selectedTracker" class="pp-empty">
        <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('clipboard')"></path></svg>
        <span>Select a work order to view its tracker</span>
      </div>

      <!-- Selected tracker body -->
      <div v-else class="pp-body">
        <div
          v-if="content.showStatus !== false && (statusText || showEmpty)"
          class="pp-status"
          :class="'pp-status--' + (statusText ? statusTone(statusText) : 'neutral')"
        >
          <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('clock')"></path></svg>
          <span>{{ statusText || emptyText }}</span>
        </div>

        <!-- Description -->
        <section v-if="content.showDescription !== false && (descriptionText || showEmpty)" class="pp-block">
          <h4 v-if="content.descriptionLabel" class="pp-block__title">{{ content.descriptionLabel }}</h4>
          <div v-if="descriptionText && content.descriptionHtml" class="pp-desc pp-desc--html" v-html="descriptionText"></div>
          <p v-else class="pp-desc" :class="{ 'pp-desc--none': !descriptionText }">{{ descriptionText || emptyText }}</p>
        </section>

        <!-- Notes -->
        <section v-if="content.showNotes !== false && (notesText || showEmpty)" class="pp-block">
          <h4 v-if="content.notesLabel" class="pp-block__title">{{ content.notesLabel }}</h4>
          <div v-if="notesText && content.notesHtml" class="pp-desc pp-desc--html" v-html="notesText"></div>
          <p v-else class="pp-desc" :class="{ 'pp-desc--none': !notesText }">{{ notesText || emptyText }}</p>
        </section>

        <!-- Labor / Material -->
        <section v-if="content.showFinancials !== false && (laborVal !== '' || materialVal !== '' || showEmpty)" class="pp-stats">
          <div v-if="laborVal !== '' || showEmpty" class="pp-stat">
            <span class="pp-stat__ico"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('dollar')"></path></svg></span>
            <span class="pp-stat__label">{{ content.laborLabel }}</span>
            <span class="pp-stat__value" :class="{ 'pp-stat__value--none': laborVal === '' }">{{ laborVal !== '' ? money(laborVal) : emptyText }}</span>
          </div>
          <div v-if="materialVal !== '' || showEmpty" class="pp-stat">
            <span class="pp-stat__ico"><svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('dollar')"></path></svg></span>
            <span class="pp-stat__label">{{ content.materialLabel }}</span>
            <span class="pp-stat__value" :class="{ 'pp-stat__value--none': materialVal === '' }">{{ materialVal !== '' ? money(materialVal) : emptyText }}</span>
          </div>
        </section>

        <!-- Completion photos -->
        <section v-if="content.showAfter !== false && (afterPhotos.length || showEmpty)" class="pp-block">
          <h4 class="pp-block__title">
            <svg class="pp-svg pp-block__ico" v-bind="svgAttrs"><path :d="ic('image')"></path></svg>
            {{ content.afterLabel }} <span class="pp-count">{{ afterPhotos.length }}</span>
          </h4>
          <div v-if="afterPhotos.length" class="pp-thumbs">
            <button v-for="(p, i) in afterPhotos" :key="'a' + i" type="button" class="pp-thumb" @click="emitPhoto('after', i, p)">
              <img v-if="photoThumb(p)" :src="photoThumb(p)" :alt="content.afterLabel + ' ' + (i + 1)" />
              <svg v-else class="pp-svg" v-bind="svgAttrs"><path :d="ic('image')"></path></svg>
            </button>
          </div>
          <p v-else class="pp-desc pp-desc--none">{{ emptyText }}</p>
        </section>

        <!-- Before photos -->
        <section v-if="content.showBefore !== false && (beforePhotos.length || showEmpty)" class="pp-block">
          <h4 class="pp-block__title">
            <svg class="pp-svg pp-block__ico" v-bind="svgAttrs"><path :d="ic('image')"></path></svg>
            {{ content.beforeLabel }} <span class="pp-count">{{ beforePhotos.length }}</span>
          </h4>
          <div v-if="beforePhotos.length" class="pp-thumbs">
            <button v-for="(p, i) in beforePhotos" :key="'b' + i" type="button" class="pp-thumb" @click="emitPhoto('before', i, p)">
              <img v-if="photoThumb(p)" :src="photoThumb(p)" :alt="content.beforeLabel + ' ' + (i + 1)" />
              <svg v-else class="pp-svg" v-bind="svgAttrs"><path :d="ic('image')"></path></svg>
            </button>
          </div>
          <p v-else class="pp-desc pp-desc--none">{{ emptyText }}</p>
        </section>

        <!-- Activity feed -->
        <section v-if="content.showActivity !== false" class="pp-block">
          <div class="pp-block__bar">
            <h4 class="pp-block__title">
              <svg class="pp-svg pp-block__ico" v-bind="svgAttrs"><path :d="ic('rss')"></path></svg>
              {{ content.activityLabelText }}
            </h4>
            <button v-if="content.showAddActivity !== false" type="button" class="pp-addbtn" @click="emitAddActivity">
              <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('plus')"></path></svg>
              <span>{{ content.addActivityLabel }}</span>
            </button>
          </div>
          <ul v-if="activityItems.length" class="pp-feed">
            <li v-for="(f, i) in pagedActivity" :key="actPageOffset + i" class="pp-feeditem" :class="{ 'pp-feeditem--last': i === pagedActivity.length - 1 }">
              <span class="pp-feeditem__avatar">
                <img v-if="avatarUrl(f)" :src="avatarUrl(f)" :alt="authorName(f)" />
                <template v-else>{{ initials(authorName(f)) }}</template>
              </span>
              <div class="pp-feeditem__body">
                <div class="pp-feeditem__head">
                  <strong>{{ authorName(f) || 'Unknown' }}</strong>
                  <span v-if="actLabel(f)" class="pp-feeditem__activity">{{ actLabel(f) }}</span>
                  <span class="pp-muted">{{ timeText(f) }}</span>
                </div>
                <template v-if="bodyText(f)">
                  <div v-if="content.activityHtml !== false" class="pp-feeditem__text" v-html="bodyText(f)"></div>
                  <p v-else class="pp-feeditem__text">{{ stripHtml(bodyText(f)) }}</p>
                </template>
                <div v-if="attachmentsOf(f).length" class="pp-atts">
                  <button
                    v-for="(att, j) in attachmentsOf(f)"
                    :key="j"
                    type="button"
                    class="pp-att"
                    :class="isImage(att) ? 'pp-att--img' : 'pp-att--file'"
                    :title="attName(att)"
                    @click="emitAtt(att)"
                  >
                    <template v-if="isImage(att)">
                      <img v-if="attThumb(att)" :src="attThumb(att)" :alt="attName(att)" />
                      <svg v-else class="pp-svg" v-bind="svgAttrs"><path :d="ic('image')"></path></svg>
                    </template>
                    <template v-else>
                      <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('file')"></path></svg>
                      <span class="pp-att__name">{{ attName(att) }}</span>
                    </template>
                  </button>
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="pp-feed__empty">{{ emptyText }}</div>

          <div v-if="actPaginationActive" class="pp-pager">
            <button class="pp-pager__btn" type="button" :disabled="actPage <= 1" aria-label="Previous page" @click="goActPage(actPage - 1)">
              <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-left')"></path></svg>
            </button>
            <span class="pp-pager__info">Page {{ actPage }} of {{ actTotalPages }}</span>
            <button class="pp-pager__btn" type="button" :disabled="actPage >= actTotalPages" aria-label="Next page" @click="goActPage(actPage + 1)">
              <svg class="pp-svg" v-bind="svgAttrs"><path :d="ic('chevron-right')"></path></svg>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
const ICONS = {
  "chevron-down": "M6 9l6 6 6-6",
  check: "M20 6L9 17l-5-5",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  clipboard: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  image: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  rss: "M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  plus: "M12 5v14M5 12h14",
  "chevron-left": "M15 18l-6-6 6-6",
  "chevron-right": "M9 18l6-6-6-6",
};

export default {
  props: { content: { type: Object, required: true }, uid: { type: String, required: false } },
  emits: ["trigger-event"],
  data() {
    return {
      open: false,
      search: "",
      selId: this.content.selectedId != null && this.content.selectedId !== "" ? String(this.content.selectedId) : null,
      actPage: 1,
    };
  },
  watch: {
    "content.selectedId"(v) {
      this.selId = v != null && v !== "" ? String(v) : null;
    },
    selId() { this.actPage = 1; },
    activityCount(n) {
      const tp = Math.max(1, Math.ceil(n / this.actPageSize));
      if (this.actPage > tp) this.actPage = tp;
    },
  },
  computed: {
    trackers() {
      const raw = this.content.trackers;
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object") {
        if (Array.isArray(raw.data)) return raw.data;
        if (Array.isArray(raw.items)) return raw.items;
      }
      return [];
    },
    filteredTrackers() {
      const q = (this.search || "").trim().toLowerCase();
      if (!q) return this.trackers;
      return this.trackers.filter((t) => this.optionLabel(t).toLowerCase().indexOf(q) !== -1);
    },
    selectedTracker() {
      if (this.selId == null) return null;
      return this.trackers.find((t) => String(this.trackerId(t)) === String(this.selId)) || null;
    },
    statusText() { return this.str(this.fieldVal(this.selectedTracker, this.content.statusField, ["status", "state"])); },
    descriptionText() { return this.str(this.fieldVal(this.selectedTracker, this.content.descriptionField, ["description", "scope", "details"])); },
    notesText() { return this.str(this.fieldVal(this.selectedTracker, this.content.notesField, ["notes", "note", "internal_notes"])); },
    laborVal() { const v = this.fieldVal(this.selectedTracker, this.content.laborField, ["labor", "labor_total", "labour"]); return v == null ? "" : v; },
    materialVal() { const v = this.fieldVal(this.selectedTracker, this.content.materialField, ["material", "materials", "material_total"]); return v == null ? "" : v; },
    afterPhotos() { return this.photoList(this.content.afterPhotosField, ["completion_photos", "after_photos", "afterPhotos", "after", "photos", "completionPhotos"]); },
    beforePhotos() { return this.photoList(this.content.beforePhotosField, ["before_photos", "beforePhotos", "before"]); },
    activityItems() {
      let raw;
      if (this.content.activitySource === "bound") {
        raw = this.content.activity;
      } else {
        raw = this.fieldVal(this.selectedTracker, this.content.activityField, ["activity_feed", "activities", "activity", "feed"]);
      }
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object" && Array.isArray(raw.data)) return raw.data;
      return [];
    },
    activityCount() { return this.activityItems.length; },
    actPageSize() { const n = Number(this.content.activityPageSize); return n > 0 ? Math.floor(n) : 5; },
    actTotalPages() { return Math.max(1, Math.ceil(this.activityCount / this.actPageSize)); },
    actPaginationActive() { return this.content.paginateActivity !== false && this.actTotalPages > 1; },
    actPageOffset() { return this.content.paginateActivity !== false ? (this.actPage - 1) * this.actPageSize : 0; },
    pagedActivity() {
      if (this.content.paginateActivity === false) return this.activityItems;
      return this.activityItems.slice(this.actPageOffset, this.actPageOffset + this.actPageSize);
    },
    showEmpty() { return this.content.showEmptyValues !== false; },
    emptyText() { return this.content.emptyText != null && this.content.emptyText !== "" ? this.content.emptyText : "None"; },
    svgAttrs() {
      return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" };
    },
    themeClass() {
      const m = this.content.darkMode || "auto";
      return { "pp-auto": m === "auto", "pp-dark": m === "dark", "pp-light": m === "light" };
    },
    rootStyle() {
      return {
        "--pp-primary": this.content.primaryColor || "#10b981",
        "--pp-accent": this.content.accentColor || "#6366f1",
        "--pp-radius": (this.content.radius != null ? this.content.radius : 16) + "px",
      };
    },
  },
  methods: {
    ic(name) { return ICONS[name] || ""; },
    str(v) { return v == null ? "" : String(v); },
    fieldVal(obj, key, fallbacks) {
      if (!obj) return undefined;
      if (key && obj[key] != null) return obj[key];
      for (let i = 0; i < (fallbacks || []).length; i++) {
        const k = fallbacks[i];
        if (obj[k] != null) return obj[k];
      }
      return undefined;
    },
    trackerId(t) {
      const v = this.fieldVal(t, this.content.idField, ["id", "_id", "uuid", "key"]);
      return v != null ? v : "";
    },
    optionLabel(t) {
      const v = this.fieldVal(t, this.content.labelField, ["name", "label", "title", "job_number", "number", "job"]);
      return this.str(v) || ("#" + this.trackerId(t));
    },
    money(v) {
      if (v === "" || v == null) return "";
      const n = Number(v);
      const prefix = this.content.currencyPrefix != null ? this.content.currencyPrefix : "";
      if (isNaN(n)) return this.str(v);
      return prefix + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    },
    statusTone(s) {
      const t = String(s || "").toLowerCase();
      if (/cancel/.test(t)) return "warn";
      if (/reject|declin|fail|overdue|void/.test(t)) return "danger";
      if (/complete|done|paid|closed|approved|finished/.test(t)) return "ok";
      if (/progress|active|open|pending|schedul|review/.test(t)) return "info";
      return "neutral";
    },
    photoList(key, fallbacks) {
      let arr = this.fieldVal(this.selectedTracker, key, fallbacks);
      if (Array.isArray(arr)) return arr;
      if (arr && typeof arr === "object" && Array.isArray(arr.data)) return arr.data;
      return [];
    },
    // Prefer a lightweight thumbnail (Airtable `thumbnails.{small,large,full}.url`)
    // over the heavy original `url`. Returns "" only if nothing usable exists.
    thumbUrl(obj) {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      const t = obj.thumbnails;
      if (t && typeof t === "object") {
        const size = this.content.thumbnailSize || "large";
        const order = size === "small" ? ["small", "large", "full"]
          : size === "full" ? ["full", "large", "small"]
          : ["large", "small", "full"];
        for (let i = 0; i < order.length; i++) {
          const k = order[i];
          if (t[k] && t[k].url) return t[k].url;
        }
      }
      return obj.thumbnail_url || obj.thumbnailUrl || obj.thumbnail || obj.url || obj.src || obj.image || "";
    },
    photoThumb(p) { return this.thumbUrl(p); },
    photoUrl(p) {
      if (!p) return "";
      if (typeof p === "string") return p;
      return p.url || p.src || p.image || p.thumbnail_url || "";
    },
    // ---- activity field resolution (matches pp-feed activity_feed shape) ----
    authorName(f) {
      if (!f) return "";
      return f.author || (f.user_id && f.user_id.name) || (f.user && f.user.name) || f.name || "";
    },
    avatarUrl(f) {
      if (!f) return "";
      return f.avatar || (f.user_id && f.user_id.headshot) || (f.user && f.user.headshot) || f.headshot || "";
    },
    timeText(f) {
      if (!f) return "";
      if (f.time) return f.time;
      const raw = f.created_at || f.createdAt || f.date;
      if (!raw) return "";
      const d = new Date(raw);
      if (isNaN(d)) return String(raw);
      return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    },
    actLabel(f) { return (f && (f.activity || f.action)) || ""; },
    bodyText(f) { return (f && (f.text || f.description)) || ""; },
    stripHtml(s) { return String(s == null ? "" : s).replace(/<[^>]*>/g, "").trim(); },
    initials(name) { return (name || "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); },
    attachmentsOf(f) { return f && Array.isArray(f.attachments) ? f.attachments : []; },
    isImage(att) {
      if (!att) return false;
      const ct = (att.content_type || att.contentType || att.type || "").toLowerCase();
      if (ct) return ct.indexOf("image/") === 0;
      const u = (att.url || att || "").toString().toLowerCase();
      return /\.(png|jpe?g|gif|webp|svg|bmp)(\?|$)/.test(u);
    },
    attThumb(att) { return this.thumbUrl(att); },
    attName(att) {
      if (!att) return "File";
      if (att.name || att.filename) return att.name || att.filename;
      const ct = att.content_type || att.contentType || att.type || "";
      const sub = ct.split("/")[1];
      if (sub) return sub.toUpperCase();
      const u = (att.url || "").toString().split("?")[0];
      const base = u.substring(u.lastIndexOf("/") + 1);
      return base || "File";
    },
    // ---- interactions ----
    toggleOpen() {
      this.open = !this.open;
      if (this.open && this.content.searchable !== false) {
        this.$nextTick(() => { if (this.$refs.search) this.$refs.search.focus(); });
      }
    },
    choose(t) {
      const id = this.trackerId(t);
      this.selId = id != null ? String(id) : null;
      this.open = false;
      this.search = "";
      const index = this.trackers.indexOf(t);
      this.$emit("trigger-event", { name: "select", event: { id: id != null ? id : "", index, tracker: t || {} } });
    },
    emitOpenRecord() {
      const t = this.selectedTracker;
      const url = this.str(this.fieldVal(t, this.content.recordLinkField, ["url", "link", "href", "path"]));
      this.$emit("trigger-event", { name: "openRecord", event: { id: this.trackerId(t) || "", url, tracker: t || {} } });
    },
    attType(att) { return (att && (att.content_type || att.contentType || att.type)) || ""; },
    emitPhoto(group, index, p) {
      // `photos` is the FULL attachment array for the clicked group, so it can be
      // bound straight to the Attachment Viewer (attachments: event.photos,
      // startIndex: event.index).
      const photos = group === "before" ? this.beforePhotos : this.afterPhotos;
      this.$emit("trigger-event", {
        name: "photoClick",
        event: {
          group,
          index,
          url: this.photoUrl(p),
          type: this.attType(p),
          filename: this.attName(p),
          isImage: this.isImage(p),
          photo: p || {},
          photos: Array.isArray(photos) ? photos.slice() : [],
        },
      });
    },
    emitAddActivity() {
      const t = this.selectedTracker;
      this.$emit("trigger-event", { name: "addActivity", event: { id: this.trackerId(t) || "", tracker: t || {} } });
    },
    goActPage(p) {
      const next = Math.max(1, Math.min(this.actTotalPages, p));
      if (next === this.actPage) return;
      this.actPage = next;
      this.$emit("trigger-event", { name: "activityPageChange", event: { page: next } });
    },
    emitAtt(att) {
      this.$emit("trigger-event", {
        name: "attachmentClick",
        event: {
          url: (att && att.url) || "",
          type: this.attType(att),
          filename: this.attName(att),
          isImage: this.isImage(att),
          attachment: att || null,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.pp-root {
  --surface: #ffffff; --surface-2: #f7f9fc; --surface-3: #eef2f7; --border: #e4e9f0; --border-strong: #d4dbe6;
  --text: #1f2a37; --text-muted: #64748b; --text-subtle: #94a3b8;
  --shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06);
  --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --ok: #10b981; --info: #3b82f6; --warn: #f59e0b; --danger: #ef4444;
  --accent: var(--pp-accent, #6366f1); --primary: var(--pp-primary, #10b981); --radius: var(--pp-radius, 16px);
  box-sizing: border-box; width: 100%; max-width: 100%; color: var(--text);
  container-type: inline-size;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.45;
}
.pp-root *, .pp-root *::before, .pp-root *::after { box-sizing: border-box; }
@mixin dark {
  --surface: #161f30; --surface-2: #1b2638; --surface-3: #202c40; --border: #28344a; --border-strong: #34425c;
  --text: #e8eef7; --text-muted: #94a3b8; --text-subtle: #64748b;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 12px 28px rgba(0, 0, 0, 0.35);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.pp-root.pp-dark { @include dark; }
@media (prefers-color-scheme: dark) { .pp-root.pp-auto { @include dark; } }

.pp-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: clamp(16px, 2.4vw, 22px); }

/* Header + dropdown */
.pp-head { margin-bottom: 6px; }
.pp-head__label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
.pp-select { position: relative; display: flex; align-items: stretch; gap: 8px; }
.pp-select__btn { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 14px; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; color: var(--text); font-family: inherit; font-size: 14px; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.pp-select__btn:hover { border-color: var(--primary); }
.pp-select--open .pp-select__btn { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 18%, transparent); }
.pp-select__value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pp-select__value--ph { color: var(--text-subtle); }
.pp-select__chev { width: 18px; height: 18px; flex: none; color: var(--text-muted); transition: transform .18s; }
.pp-select--open .pp-select__chev { transform: rotate(180deg); }
.pp-select__link { flex: none; display: grid; place-items: center; width: 44px; border: 1px solid var(--border-strong); border-radius: 10px; background: var(--surface); color: var(--text-muted); cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
.pp-select__link:hover { background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); border-color: var(--primary); }
.pp-select__link .pp-svg { width: 18px; height: 18px; }

.pp-select__backdrop { position: fixed; inset: 0; z-index: 40; }
.pp-select__menu { position: absolute; z-index: 41; top: calc(100% + 6px); left: 0; right: 0; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 12px; box-shadow: var(--shadow); padding: 6px; max-height: 320px; overflow: auto; }
.pp-select__search { padding: 4px 4px 8px; }
.pp-select__search input { width: 100%; padding: 9px 12px; border: 1px solid var(--border-strong); border-radius: 8px; background: var(--surface-2); color: var(--text); font-family: inherit; font-size: 13.5px; outline: none; }
.pp-select__search input:focus { border-color: var(--primary); }
.pp-select__list { list-style: none; margin: 0; padding: 0; }
.pp-select__opt { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; color: var(--text); font-size: 13.5px; transition: background .12s; }
.pp-select__opt:hover { background: var(--surface-3); }
.pp-select__opt--active { background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--primary); font-weight: 600; }
.pp-select__check { width: 16px; height: 16px; flex: none; color: var(--primary); }
.pp-select__empty { padding: 14px 12px; color: var(--text-subtle); font-size: 13px; text-align: center; }

/* Body */
.pp-body { margin-top: 18px; display: flex; flex-direction: column; gap: 20px; }
.pp-status { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start; padding: 6px 12px; border-radius: 999px; font-size: 13px; font-weight: 600; }
.pp-status .pp-svg { width: 15px; height: 15px; }
.pp-status--neutral { background: var(--surface-3); color: var(--text-muted); }
.pp-status--ok { background: color-mix(in srgb, var(--ok) 14%, transparent); color: var(--ok); }
.pp-status--info { background: color-mix(in srgb, var(--info) 14%, transparent); color: var(--info); }
.pp-status--warn { background: color-mix(in srgb, var(--warn) 16%, transparent); color: var(--warn); }
.pp-status--danger { background: color-mix(in srgb, var(--danger) 14%, transparent); color: var(--danger); }

.pp-block { display: flex; flex-direction: column; gap: 10px; }
.pp-block__bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.pp-block__title { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--text); text-transform: none; letter-spacing: .01em; }
.pp-addbtn { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border: 1px solid var(--border-strong); border-radius: 9px; background: var(--surface); color: var(--primary); font-family: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background .15s, border-color .15s; }
.pp-addbtn:hover { background: color-mix(in srgb, var(--primary) 12%, transparent); border-color: var(--primary); }
.pp-addbtn .pp-svg { width: 15px; height: 15px; }
.pp-block__ico { width: 16px; height: 16px; color: var(--text-muted); }
.pp-count { display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: var(--surface-3); color: var(--text-muted); font-size: 11.5px; font-weight: 700; }
.pp-desc { margin: 0; color: var(--text-muted); font-size: 13.5px; white-space: pre-wrap; overflow-wrap: anywhere; }
.pp-desc--none { color: var(--text-subtle); font-style: italic; }
.pp-stat__value--none { color: var(--text-subtle); font-weight: 600; font-style: italic; }
.pp-desc--html :deep(p) { margin: 0 0 6px; }
.pp-desc--html :deep(a) { color: var(--info); }
.pp-desc--html :deep(ul), .pp-desc--html :deep(ol) { margin: 4px 0; padding-left: 18px; }

.pp-stats { display: grid; grid-template-columns: 1fr; gap: 10px; }
@container (min-width: 360px) { .pp-stats { grid-template-columns: 1fr 1fr; } }
.pp-stat { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface-2); }
.pp-stat__ico { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; background: color-mix(in srgb, var(--primary) 14%, transparent); color: var(--primary); flex: none; }
.pp-stat__ico .pp-svg { width: 16px; height: 16px; }
.pp-stat__label { color: var(--text-muted); font-size: 13px; font-weight: 600; }
.pp-stat__value { margin-left: auto; font-size: 15px; font-weight: 700; color: var(--text); }

.pp-thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 76px), 1fr)); gap: 8px; }
.pp-thumb { display: grid; place-items: center; aspect-ratio: 1 / 1; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-subtle); cursor: pointer; padding: 0; transition: border-color .15s, transform .12s; }
.pp-thumb:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.pp-thumb img { width: 100%; height: 100%; object-fit: cover; }
.pp-thumb .pp-svg { width: 22px; height: 22px; }

/* Activity feed */
.pp-feed { list-style: none; margin: 0; padding: 0; }
.pp-feeditem { display: flex; gap: 12px; padding-bottom: 18px; position: relative; }
.pp-feeditem::before { content: ""; position: absolute; left: 17px; top: 40px; bottom: 0; width: 2px; background: var(--border); }
.pp-feeditem--last { padding-bottom: 0; }
.pp-feeditem--last::before { display: none; }
.pp-feeditem__avatar { flex: none; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); font-weight: 700; font-size: 12px; z-index: 1; }
.pp-feeditem__avatar img { width: 100%; height: 100%; object-fit: cover; }
.pp-feeditem__body { flex: 1; min-width: 0; }
.pp-feeditem__head { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; flex-wrap: wrap; min-width: 0; }
.pp-feeditem__head strong { color: var(--text); font-size: 13px; }
.pp-feeditem__head .pp-muted { font-size: 12px; }
.pp-feeditem__activity { color: var(--text); font-weight: 600; font-size: 13px; }
.pp-feeditem__text { margin: 0; color: var(--text-muted); font-size: 13.5px; overflow-wrap: anywhere; }
.pp-feeditem__text :deep(p) { margin: 0; }
.pp-feeditem__text :deep(a) { color: var(--info); }
.pp-feed__empty { color: var(--text-subtle); font-size: 13px; padding: 4px 0 2px; }

.pp-pager { display: flex; align-items: center; justify-content: center; gap: 14px; padding-top: 14px; margin-top: 6px; border-top: 1px solid var(--border); }
.pp-pager__btn { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--text-muted); cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
.pp-pager__btn:hover:not(:disabled) { background: var(--surface-3); color: var(--text); border-color: var(--border-strong); }
.pp-pager__btn:disabled { opacity: .4; cursor: default; }
.pp-pager__btn .pp-svg { width: 16px; height: 16px; }
.pp-pager__info { font-size: 13px; font-weight: 600; color: var(--text-muted); min-width: 96px; text-align: center; }

.pp-atts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.pp-att { text-decoration: none; cursor: pointer; font-family: inherit; padding: 0; border: none; }
.pp-att--img { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 9px; overflow: hidden; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-subtle); transition: border-color .15s, transform .12s; }
.pp-att--img:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.pp-att--img img { width: 100%; height: 100%; object-fit: cover; }
.pp-att--img .pp-svg { width: 20px; height: 20px; }
.pp-att--file { display: inline-flex; align-items: center; gap: 7px; max-width: 100%; min-width: 0; padding: 8px 11px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-muted); font-size: 12.5px; font-weight: 600; transition: border-color .15s, color .15s; }
.pp-att--file:hover { border-color: var(--border-strong); color: var(--text); }
.pp-att--file .pp-svg { width: 15px; height: 15px; flex: none; color: var(--danger); }
.pp-att__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pp-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 40px 16px; color: var(--text-subtle); margin-top: 14px; }
.pp-empty .pp-svg { width: 30px; height: 30px; }
.pp-svg { display: block; }

@supports not (container-type: inline-size) {
  @media (min-width: 360px) { .pp-stats { grid-template-columns: 1fr 1fr; } }
}
</style>
