import { h } from "virtual-dom";
import DiscourseURL from "discourse/lib/url";
import QuickAccessPanel from "discourse/widgets/quick-access-panel";
import RawHtml from "discourse/widgets/raw-html";
import UserAction from "discourse/models/user-action";
import { ajax } from "discourse/lib/ajax";
import { createWidget, createWidgetFrom } from "discourse/widgets/widget";
import { emojiUnescape } from "discourse/lib/text";
import { iconNode } from "discourse-common/lib/icon-library";
import { postUrl } from "discourse/lib/utilities";

const ICON = "bookmark";

createWidget("quick-access-item", {
  tagName: "li.read",

  buildClasses(attrs) {
    const result = [];
    if (attrs.className) {
      result.push(attrs.className);
    }
    return result;
  },

  usernameHtml() {
    return this.attrs.username ? `<span>${this.attrs.username}</span> ` : "";
  },

  html({ icon, href, content }) {
    return h("a", { attributes: { href } }, [
      iconNode(icon),
      new RawHtml({
        html: `<div>${this.usernameHtml()}${emojiUnescape(
          Handlebars.Utils.escapeExpression(content)
        )}</div>`
      })
    ]);
  },

  click(e) {
    if (this.attrs.action) {
      e.preventDefault();
      return this.sendWidgetAction(this.attrs.action, this.attrs.actionParam);
    }
  }
});

let staleItems = [];

// The empty state help text for bookmarks page is localized on the server.
let emptyStatePlaceholderItemText = "";

createWidgetFrom(QuickAccessPanel, "quick-access-bookmarks", {
  buildKey: () => "quick-access-bookmarks",

  hasMore() {
    // Always show the button to the bookmarks page.
    return true;
  },

  showAll() {
    DiscourseURL.routeTo(`${this.attrs.path}/activity/bookmarks`);
  },

  emptyStatePlaceholderItem() {
    return h("li.read", emptyStatePlaceholderItemText);
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
        limit: this.estimateItemLimit(),
        no_results_help_key: "user_activity.no_bookmarks"
      }
    }).then(({ user_actions, no_results_help }) => {
      emptyStatePlaceholderItemText = no_results_help;
      return (staleItems = user_actions.slice(0, this.estimateItemLimit()));
    });
  },

  itemHtml(bookmark) {
    return this.attach("quick-access-item", {
      icon: ICON,
      href: postUrl(bookmark.slug, bookmark.topic_id, bookmark.post_number),
      content: bookmark.title,
      username: bookmark.username
    });
  }
});
