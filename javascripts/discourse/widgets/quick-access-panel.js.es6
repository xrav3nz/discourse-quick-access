import { h } from "virtual-dom";

import { createWidget } from "discourse/widgets/widget";
import { headerHeight } from "discourse/components/site-header";

/**
 * This is extracted from the existing `UserNotifications` widget, and tries to
 * enforce a consistent flow of fetching, caching, refreshing, and rendering
 * "quick access items".
 *
 * There are parts to showing a quick access panel:
 * 1. A user menu link that sends a `quickAccess` action, with a unique `type`,
 * upon being clicked.
 * 2. A `quick-access-type` widget, extending from `quick-access-panel` needs
 * to be available to rending the quick access panel.
 */
export default createWidget("quick-access-panel", {
  // Reuse the existing CSS in core.
  tagName: "div.notifications",

  buildKey: () => {
    throw Error('Cannot attach abstract widget "quick-acess-panel"');
  },

  markReadRequest() {
    return Ember.RSVP.Promise.resolve();
  },

  hasUnread() {
    return false;
  },

  showAll() {},

  hasMore() {
    return false;
  },

  findStaleItems() {
    return [];
  },

  findNewItems() {
    return Ember.RSVP.Promise.resolve([]);
  },

  newItemsLoaded() {},

  itemHtml(item) {}, // eslint-disable-line no-unused-vars

  defaultState() {
    return { items: [], loading: false, loaded: false };
  },

  markRead() {
    this.markReadRequest().then(() => {
      this.refreshNotifications(this.state);
    });
  },

  estimateItemLimit() {
    // estimate (poorly) the amount of notifications to return
    let limit = Math.round(($(window).height() - headerHeight()) / 55);

    // we REALLY don't want to be asking for negative counts of notifications
    // less than 5 is also not that useful
    if (limit < 5) {
      limit = 5;
    } else if (limit > 40) {
      limit = 40;
    }

    return limit;
  },

  refreshNotifications(state) {
    if (this.loading) {
      return;
    }

    const staleItems = this.findStaleItems();

    if (staleItems.length > 0) {
      state.items = staleItems;
    } else {
      state.loading = true;
    }

    this.findNewItems()
      .then(items => {
        state.items = items;
      })
      .catch(() => {
        state.items = [];
      })
      .finally(() => {
        state.loading = false;
        state.loaded = true;
        this.newItemsLoaded();
        this.sendWidgetAction("itemsLoaded", {
          hasUnread: this.hasUnread(),
          markRead: () => this.markRead()
        });
        this.scheduleRerender();
      });
  },

  html(attrs, state) {
    if (!state.loaded) {
      this.refreshNotifications(state);
    }

    if (state.loading) {
      return [h("div.spinner-container", h("div.spinner"))];
    }

    const virtualDom = [];

    if (state.items.length) {
      virtualDom.push(h("hr"));

      const items = state.items.map(this.itemHtml.bind(this));

      if (this.hasMore()) {
        items.push(
          h(
            "li.read.last.heading.show-all",
            this.attach("button", {
              title: "notifications.more",
              icon: "chevron-down",
              action: "showAll",
              className: "btn"
            })
          )
        );
      }

      virtualDom.push(h("ul", items));
    }

    return virtualDom;
  }
});
