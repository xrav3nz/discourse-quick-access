import { withPluginApi } from "discourse/lib/plugin-api";

const UserMenuAction = {
  QUICK_ACCESS: "quickAccess"
};

const QuickAccess = {
  NOTIFICATIONS: "notifications"
};

const UserMenu = {
  quickAccess(type) {
    if (this.state.currentQuickAccess !== type) {
      this.state.currentQuickAccess = type;
    }
  },

  defaultState() {
    return {
      hasUnread: false,
      markUnread: null,
      currentQuickAccess: QuickAccess.NOTIFICATIONS
    };
  },
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

      api.reopenWidget("user-menu", UserMenu);
    });
  }
};
