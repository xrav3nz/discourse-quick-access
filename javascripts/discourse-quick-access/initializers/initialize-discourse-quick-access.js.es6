import { h } from "virtual-dom";
import { withPluginApi } from "discourse/lib/plugin-api";

const UserMenuAction = {
  QUICK_ACCESS: "quickAccess"
};

const QuickAccess = {
  ASSIGNMENTS: "assignments",
  BOOKMARKS: "bookmarks",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
  PROFILE: "profile"
};

const UserMenuLinks = {
  profileLink() {
    return Object.assign({}, this._super(), {
      action: UserMenuAction.QUICK_ACCESS,
      actionParam: QuickAccess.PROFILE
    });
  },

  bookmarksGlyph() {
    return Object.assign({}, this._super(), {
      action: UserMenuAction.QUICK_ACCESS,
      actionParam: QuickAccess.BOOKMARKS
    });
  },

  messagesGlyph() {
    return Object.assign({}, this._super(), {
      action: UserMenuAction.QUICK_ACCESS,
      actionParam: QuickAccess.MESSAGES
    });
  },

  isActive({ action, actionParam }) {
    return (
      action === UserMenuAction.QUICK_ACCESS &&
      actionParam === this.attrs.currentQuickAccess
    );
  },

  linkHtml(link) {
    link = this._markAsActive(link);
    return this._super(link);
  },

  glyphHtml(glyph) {
    glyph = this._overrideBeforeRendering(glyph);
    glyph = this._markAsActive(glyph);
    return this._super(glyph);
  },

  _markAsActive(definition) {
    if (this.isActive(definition)) {
      // Clicking on an active quick access tab icon should redirect the user
      // to the full page.
      delete definition.action;
      delete definition.actionParam;

      if (definition.className) {
        definition.className += " active";
      } else {
        definition.className = "active";
      }
    }
    return definition;
  },

  _overrideBeforeRendering(definition) {
    if (definition.className === "assigned") {
      return Object.assign({}, definition, {
        action: UserMenuAction.QUICK_ACCESS,
        actionParam: QuickAccess.ASSIGNMENTS
      });
    } else if (definition.className === "user-preferences-link") {
      return Object.assign({}, definition, {
        attributes: {
          style: "display: none;"
        }
      });
    }
    return definition;
  }
};

const UserMenu = {
  quickAccess(type) {
    if (this.state.currentQuickAccess !== type) {
      this.state.currentQuickAccess = type;
    }
  },

  defaultState() {
    return Object.assign({}, this._super(), {
      currentQuickAccess: QuickAccess.NOTIFICATIONS
    });
  },

  panelContents() {
    const path = this.currentUser.get("path");
    const { currentQuickAccess } = this.state;

    const result = [
      this.attach("user-menu-links", {
        path,
        currentQuickAccess
      }),
      this.quickAccessPanel(path)
    ];

    if (this.state.hasUnread) {
      result.push(h("hr.bottom-area"));
      result.push(this.attach("user-menu-dismiss-link"));
    }

    return result;
  },

  quickAccessPanel(path) {
    const { showLogoutButton } = this.settings;
    // This deliberately does NOT fallback to a default quick access panel.
    return this.attach(`quick-access-${this.state.currentQuickAccess}`, {
      path,
      showLogoutButton
    });
  },

  itemsLoaded({ hasUnread, markRead }) {
    this.state.hasUnread = hasUnread;
    this.state.markRead = markRead;
  }
};

export default {
  name: "discourse-quick-access-initializer",
  initialize() {
    withPluginApi("0.8.7", api => {
      api.addUserMenuGlyph(({ attrs }) => ({
        label: "user.notifications",
        className: "user-notifications-link",
        icon: "bell",
        href: `${attrs.path}/notifications`,
        action: UserMenuAction.QUICK_ACCESS,
        actionParam: QuickAccess.NOTIFICATIONS
      }));

      api.reopenWidget("user-menu-links", UserMenuLinks);
      api.reopenWidget("user-menu", UserMenu);
    });
  }
};
