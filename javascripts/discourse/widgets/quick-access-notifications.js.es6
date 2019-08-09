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
    if (!this.currentUser.get("enforcedSecondFactor")) {
      this.currentUser.set("unread_notifications", 0);
    }
  },

  findStaleItems() {
    const silent = this.currentUser.get("enforcedSecondFactor");
    const limit = this.estimateItemLimit();

    const stale = this.store.findStale(
      "notification",
      { recent: true, silent, limit },
      { cacheKey: "recent-notifications" }
    );

    if (stale.hasResults) {
      const results = stale.results;
      let content = results.get("content");

      // we have to truncate to limit, otherwise we will render too much
      if (content && content.length > limit) {
        content = content.splice(0, limit);
        results.set("content", content);
        results.set("totalRows", limit);
      }

      return content;
    } else {
      return [];
    }
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
    const silent = this.currentUser.get("enforcedSecondFactor");
    const limit = this.estimateItemLimit();

    return this.store
      .findStale(
        "notification",
        { recent: true, silent, limit },
        { cacheKey: "recent-notifications" }
      )
      .refresh();
  },

  showAll() {
    DiscourseURL.routeTo(`${this.attrs.path}/notifications`);
  },

  hasUnread() {
    return this.state.items.filterBy("read", false).length > 0;
  }
});
