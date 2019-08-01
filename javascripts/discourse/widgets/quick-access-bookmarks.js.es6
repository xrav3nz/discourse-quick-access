import { h } from "virtual-dom";
import DiscourseURL from "discourse/lib/url";
import QuickAccessPanel from "discourse/widgets/quick-access-panel";
import UserAction from "discourse/models/user-action";
import { ajax } from "discourse/lib/ajax";
import { createWidget, createWidgetFrom } from "discourse/widgets/widget";
import { iconNode } from "discourse-common/lib/icon-library";
import { postUrl } from "discourse/lib/utilities";

createWidget("quick-access-item", {
  tagName: "li.read",

  html({ icon, href, content }) {
    return h("a", { attributes: { href } }, [iconNode(icon), content]);
  }
});

let staleItems = [];

createWidgetFrom(QuickAccessPanel, "quick-access-bookmarks", {
  buildKey: () => "quick-access-bookmarks",

  hasMore() {
    // Always show the button to the bookmarks page.
    return true;
  },

  showAll() {
    DiscourseURL.routeTo(`${this.attrs.path}/activity/bookmarks`);
  },

  findStaleItems() {
    return staleItems || [];
  },

  findNewItems() {
    return ajax("/user_actions.json", {
      cache: "false",
      data: {
        username: this.currentUser.username,
        filter: UserAction.TYPES.bookmarks,
        limit: this.estimateItemLimit()
      }
    }).then(({ user_actions }) => {
      staleItems = user_actions;
      return user_actions;
    });
  },

  itemHtml(bookmark) {
    const icon = "bookmark";
    const href = postUrl(
      bookmark.slug,
      bookmark.topic_id,
      bookmark.post_number
    );
    const content = bookmark.title;
    return this.attach("quick-access-item", { icon, href, content });
  }
});
