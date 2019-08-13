import { ajax } from "discourse/lib/ajax";
import { createWidgetFrom } from "discourse/widgets/widget";
import DiscourseURL from "discourse/lib/url";
import QuickAccessPanel from "discourse/widgets/quick-access-panel";

createWidgetFrom(QuickAccessPanel, "quick-access-notifications", {
  buildKey: () => "quick-access-notifications",

  markReadRequest() {
    return ajax("/notifications/mark-read", { method: "PUT" });
  },

  newItemsLoaded() {
    if (!this.currentUser.enforcedSecondFactor) {
      this.currentUser.set("unread_notifications", 0);
    }
  },

  findStaleItems() {
    const staleItems = this.findStaleItemsInStore_();
    return staleItems.hasResults ? staleItems.results : [];
  },

  itemHtml(notification) {
    const notificationName = this.site.notificationLookup[
      notification.notification_type
    ];

    return this.attach(
      `${notificationName.dasherize()}-notification-item`,
      notification,
      {},
      { fallbackWidgetName: "default-notification-item" }
    );
  },

  findNewItems() {
    return this.findStaleItemsInStore_().refresh();
  },

  showAll() {
    DiscourseURL.routeTo(`${this.attrs.path}/notifications`);
  },

  hasUnread() {
    return this.state.items.filterBy("read", false).length > 0;
  },

  findStaleItemsInStore_() {
    return this.store.findStale(
      "notification",
      {
        recent: true,
        silent: this.currentUser.enforcedSecondFactor,
        limit: this.estimateItemLimit()
      },
      { cacheKey: "recent-notifications" }
    );
  }
});
