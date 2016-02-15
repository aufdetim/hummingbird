import Ember from 'ember';
import libraryStatus from 'client/utils/library-status';

const REMOVE_KEY = 'Remove from Library';
const {
  Component,
  get,
  set,
  computed,
  run,
  inject: { service }
} = Ember;

// TODO: Give feedback to the user (Toast?)
export default Component.extend({
  entry: undefined,
  anime: undefined,
  isLoading: false,

  ajax: service(),
  store: service(),
  currentSession: service(),

  status: computed('entry.status', {
    get() {
      return libraryStatus.enumToHuman(get(this, 'entry.status'));
    }
  }),

  statuses: computed('entry', 'status', {
    get() {
      const statuses = [...libraryStatus.getHumanStatuses()];
      if (get(this, 'entry') === undefined) {
        return statuses;
      } else {
        const status = get(this, 'status');
        statuses.splice(statuses.indexOf(status), 1);
        return statuses.concat([REMOVE_KEY]);
      }
    }
  }),

  didRender() {
    run.scheduleOnce('afterRender', this, () => {
      this.$().foundation();
    });
  },

  _addToLibrary(status) {
    const user = get(this, 'currentSession.account');
    const anime = get(this, 'anime');
    const entry = get(this, 'store').createRecord('library-entry', {
      user,
      anime,
      status: libraryStatus.humanToEnum(status)
    });
    entry.save().then(() => {
      set(this, 'entry', entry);
    });
  },

  actions: {
    updateStatus(status) {
      this.$('.dropdown-pane').foundation('close');
      const entry = get(this, 'entry');
      if (entry === undefined && get(this, 'isLoading') === false) {
        this._addToLibrary(status);
      } else {
        if (status === REMOVE_KEY) {
          // TODO: Don't confirm yet, give user option to undo via toast/feedback
          entry.destroyRecord().then(() => {
            set(this, 'entry', undefined);
          });
        } else {
          set(entry, 'status', libraryStatus.humanToEnum(status));
          entry.save();
        }
      }
    }
  }
});
