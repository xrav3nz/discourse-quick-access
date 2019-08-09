import DiscourseURL from "discourse/lib/url";
import QuickAccessPanel from "discourse/widgets/quick-access-panel";
import { createWidgetFrom } from "discourse/widgets/widget";

const PRIVATE_MESSAGE_NOTIFICATION_TYPE = 6;

let staleItems = [];

function toNotificationItem(message) {
  return Ember.Object.create({
    id: null,
    notification_type: PRIVATE_MESSAGE_NOTIFICATION_TYPE,
    read: message.last_read_post_number >= message.highest_post_number,
    topic_id: message.id,
    slug: message.slug,
    fancy_title: message.fancy_title,
    data: {
      display_username: message.last_poster_username,
      topic_title: message.title
    }
  });
}

createWidgetFrom(QuickAccessPanel, "quick-access-messages", {
  buildKey: () => "quick-access-messages",

  hasMore() {
    // Always show the button to the messages page.
    return true;
  },

  showAll() {
    DiscourseURL.routeTo(`${this.attrs.path}/messages`);
  },

  findStaleItems() {
    return staleItems || [];
  },

  findNewItems() {
    return this.store
      .findFiltered("topicList", {
        filter: `topics/private-messages/${this.currentUser.username_lower}`
      })
      .then(({ topic_list }) => {
        return (staleItems = topic_list.topics
          .map(toNotificationItem)
          .slice(0, this.estimateItemLimit()));
      });
  },

  itemHtml(message) {
    return this.attach("default-notification-item", message);
  }
});
