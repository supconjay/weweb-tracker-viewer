export default {
  editor: { label: { en: "Tracker Viewer" } },
  triggerEvents: [
    { name: "select", label: { en: "On work order selected" }, event: { id: "", index: 0, tracker: {} } },
    { name: "openRecord", label: { en: "On open record click" }, event: { id: "", url: "", tracker: {} } },
    { name: "photoClick", label: { en: "On photo click" }, event: { group: "after", index: 0, url: "", type: "", filename: "", isImage: true, photo: {} } },
    { name: "attachmentClick", label: { en: "On activity attachment click" }, event: { url: "", type: "", filename: "", isImage: false, attachment: {} } },
    { name: "addActivity", label: { en: "On add-to-activity click" }, event: { id: "", tracker: {} } },
    { name: "activityPageChange", label: { en: "On activity page change" }, event: { page: 1 } },
  ],
  properties: {
    title: { label: { en: "Header label" }, type: "Text", defaultValue: "Link a Work Order", bindable: true },

    // ---- The list shown in the dropdown ----
    trackers: {
      label: { en: "Work orders (list)" }, type: "Array", bindable: true,
      // Accepts a plain array OR a full WeWeb collection { data: [...] }.
      defaultValue: [
        {
          id: "1", name: "JOB#11 - Sarat Painting and Renovation LLC", status: "In Progress",
          description: "ADJUSTMENT\nWork reviewed and invoice reduced to matched work completed.\n\nScope of Work\n\nKitchen\nRemove all old grout and caulk from bottom of cabinets where the cabinets meet backsplash. *ALL COUNTERS",
          labor: 610, material: 56, url: "/work-orders/1",
          before_photos: [], completion_photos: [],
          activity_feed: [
            { id: "a1", action: "Message", activity: "Message", description: "test", created_at: "2026-06-24T13:10:00+00:00", user_id: { name: "Jay Helvey", headshot: "" }, attachments: [] },
          ],
        },
        {
          id: "2", name: "JOB#11 - Jay Helvey", status: "Canceled",
          description: "ADJUSTMENT\nWork reviewed and invoice reduced to matched work completed (Amt -$434.33) test\nTESTING | Kitchen and Bathroom Repairs\nRemove and replace all old grout and caulking from the bottom of the kitchen cabinets and both bathrooms.",
          labor: 610, material: 56, url: "/work-orders/2",
          before_photos: [{ url: "#", thumbnail_url: "" }, { url: "#", thumbnail_url: "" }],
          completion_photos: [{ url: "#", thumbnail_url: "" }, { url: "#", thumbnail_url: "" }, { url: "#", thumbnail_url: "" }],
          activity_feed: [
            { id: "a2", action: "Message", activity: "Message", description: "test", created_at: "2026-06-24T13:10:00+00:00", user_id: { name: "Jay Helvey", headshot: "" }, attachments: [{ url: "#", content_type: "image/jpeg" }] },
          ],
        },
        {
          id: "3", name: "JOB#11 - NO DUST PRO CLEANERS", status: "Completed",
          description: "Final clean completed. Job ready for walkthrough.",
          labor: 320, material: 0, url: "/work-orders/3",
          before_photos: [], completion_photos: [],
          activity_feed: [],
        },
      ],
    },
    placeholder: { label: { en: "Dropdown placeholder" }, type: "Text", defaultValue: "Select a work order...", bindable: true },
    searchable: { label: { en: "Searchable dropdown" }, type: "OnOff", defaultValue: true, bindable: true },
    selectedId: { label: { en: "Selected id (optional, bindable)" }, type: "Text", defaultValue: "", bindable: true },

    // ---- Field mapping: which key on each work order holds each value ----
    labelField: { label: { en: "Field: option label" }, type: "Text", defaultValue: "name", bindable: true, section: "settings" },
    idField: { label: { en: "Field: id" }, type: "Text", defaultValue: "id", bindable: true, section: "settings" },
    statusField: { label: { en: "Field: status" }, type: "Text", defaultValue: "status", bindable: true, section: "settings" },
    descriptionField: { label: { en: "Field: description" }, type: "Text", defaultValue: "description", bindable: true, section: "settings" },
    notesField: { label: { en: "Field: notes" }, type: "Text", defaultValue: "notes", bindable: true, section: "settings" },
    laborField: { label: { en: "Field: labor" }, type: "Text", defaultValue: "labor", bindable: true, section: "settings" },
    materialField: { label: { en: "Field: material" }, type: "Text", defaultValue: "material", bindable: true, section: "settings" },
    beforePhotosField: { label: { en: "Field: before photos" }, type: "Text", defaultValue: "before_photos", bindable: true, section: "settings" },
    afterPhotosField: { label: { en: "Field: completion photos" }, type: "Text", defaultValue: "completion_photos", bindable: true, section: "settings" },
    recordLinkField: { label: { en: "Field: record link/url" }, type: "Text", defaultValue: "url", bindable: true, section: "settings" },

    // ---- Activity feed source ----
    activitySource: {
      label: { en: "Activity source" }, type: "TextSelect",
      options: { options: [
        { value: "nested", label: { en: "Inside selected work order" } },
        { value: "bound", label: { en: "Separate collection (bind below)" } },
      ] }, defaultValue: "nested", bindable: true, section: "settings",
    },
    activityField: { label: { en: "Field: activity (when nested)" }, type: "Text", defaultValue: "activity_feed", bindable: true, section: "settings" },
    activity: {
      label: { en: "Activity collection (when separate)" }, type: "Array", bindable: true, section: "settings",
      defaultValue: [],
    },
    activityHtml: { label: { en: "Render activity body as HTML" }, type: "OnOff", defaultValue: true, bindable: true, section: "settings" },

    // ---- Section toggles + labels ----
    showStatus: { label: { en: "Show status" }, type: "OnOff", defaultValue: true, bindable: true },
    showDescription: { label: { en: "Show description" }, type: "OnOff", defaultValue: true, bindable: true },
    descriptionLabel: { label: { en: "Description label" }, type: "Text", defaultValue: "Description", bindable: true },
    descriptionHtml: { label: { en: "Render description as HTML" }, type: "OnOff", defaultValue: false, bindable: true },
    showNotes: { label: { en: "Show notes" }, type: "OnOff", defaultValue: true, bindable: true },
    notesLabel: { label: { en: "Notes label" }, type: "Text", defaultValue: "Notes", bindable: true },
    notesHtml: { label: { en: "Render notes as HTML" }, type: "OnOff", defaultValue: false, bindable: true },
    showFinancials: { label: { en: "Show labor / material" }, type: "OnOff", defaultValue: true, bindable: true },
    laborLabel: { label: { en: "Labor label" }, type: "Text", defaultValue: "Labor", bindable: true },
    materialLabel: { label: { en: "Material label" }, type: "Text", defaultValue: "Material", bindable: true },
    currencyPrefix: { label: { en: "Currency prefix" }, type: "Text", defaultValue: "$", bindable: true },
    showAfter: { label: { en: "Show completion photos" }, type: "OnOff", defaultValue: true, bindable: true },
    afterLabel: { label: { en: "Completion photos label" }, type: "Text", defaultValue: "Completion Photos", bindable: true },
    showBefore: { label: { en: "Show before photos" }, type: "OnOff", defaultValue: true, bindable: true },
    beforeLabel: { label: { en: "Before photos label" }, type: "Text", defaultValue: "Before Photos", bindable: true },
    showActivity: { label: { en: "Show activity feed" }, type: "OnOff", defaultValue: true, bindable: true },
    activityLabelText: { label: { en: "Activity label" }, type: "Text", defaultValue: "Activity", bindable: true },
    showAddActivity: { label: { en: "Show add-to-activity button" }, type: "OnOff", defaultValue: true, bindable: true },
    addActivityLabel: { label: { en: "Add-to-activity label" }, type: "Text", defaultValue: "Add", bindable: true },
    paginateActivity: { label: { en: "Paginate activity (built-in)" }, type: "OnOff", defaultValue: true, bindable: true },
    activityPageSize: { label: { en: "Activity items per page" }, type: "Number", options: { min: 1, max: 100, step: 1 }, defaultValue: 5, bindable: true },
    showRecordLink: { label: { en: "Show open-record link" }, type: "OnOff", defaultValue: true, bindable: true },
    recordLinkLabel: { label: { en: "Open-record label" }, type: "Text", defaultValue: "Open record", bindable: true },

    // ---- Empty + thumbnails ----
    showEmptyValues: { label: { en: "Show empty fields as placeholder" }, type: "OnOff", defaultValue: true, bindable: true },
    emptyText: { label: { en: "Empty placeholder text" }, type: "Text", defaultValue: "None", bindable: true },
    thumbnailSize: {
      label: { en: "Thumbnail size (Airtable)" }, type: "TextSelect",
      options: { options: [
        { value: "small", label: { en: "Small" } },
        { value: "large", label: { en: "Large" } },
        { value: "full", label: { en: "Full" } },
      ] }, defaultValue: "large", bindable: true,
    },

    // ---- Theme (standard across pp- components) ----
    primaryColor: { label: { en: "Primary color" }, type: "Color", defaultValue: "#10b981", bindable: true },
    accentColor: { label: { en: "Accent color" }, type: "Color", defaultValue: "#6366f1", bindable: true },
    darkMode: {
      label: { en: "Theme mode" }, type: "TextSelect",
      options: { options: [
        { value: "auto", label: { en: "Auto (system)" } },
        { value: "light", label: { en: "Light" } },
        { value: "dark", label: { en: "Dark" } },
      ] }, defaultValue: "auto", bindable: true,
    },
    radius: { label: { en: "Corner radius (px)" }, type: "Number", options: { min: 0, max: 32, step: 1 }, defaultValue: 16, bindable: true },
  },
};
