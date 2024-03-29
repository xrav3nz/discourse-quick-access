import DiscourseURL from "discourse/lib/url";
import QuickAccessPanel from "discourse/widgets/quick-access-panel";
import { createWidgetFrom } from "discourse/widgets/widget";
import { postUrl } from "discourse/lib/utilities";

const ICON = "user-plus";

let staleItems = [];

createWidgetFrom(QuickAccessPanel, "quick-access-assignments", {
  buildKey: () => "quick-access-assignments",
  emptyStatePlaceholderItemKey: "choose_topic.none_found",

  hasMore() {
    // Always show the button to the assignments page. Users cannot
    // unassign or reassign from the quick access panel.
    return true;
  },

  showAll() {
    DiscourseURL.routeTo(`${this.attrs.path}/activity/assigned`);
  },

  findStaleItems() {
    return staleItems || [];
  },

  findNewItems() {
    return this.store
      .findFiltered("topicList", {
        filter: `topics/messages-assigned/${this.currentUser.username_lower}`,
        params: {
          exclude_category_ids: [-1]
        }
      })
      .then(({ topic_list }) => {
        return (staleItems = topic_list.topics.slice(
          0,
          this.estimateItemLimit()
        ));
      });
  },

  itemHtml(assignedTopic) {
    return this.attach("quick-access-item", {
      icon: ICON,
      href: postUrl(
        assignedTopic.slug,
        assignedTopic.id,
        assignedTopic.last_read_post_number + 1
      ),
      content: assignedTopic.fancy_title
    });
  }
});
