import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import DS from 'ember-data';
import setupStore from 'client/tests/helpers/setup-store';

const { run } = Ember;
const { Model, attr } = DS;

moduleFor('service:current-session', 'Unit | Service | current session', {
  beforeEach() {
    this.store = setupStore({
      user: Model.extend({
        name: attr('string')
      })
    });
  },

  afterEach() {
    run(this.store, 'destroy');
  }
});

// Replace this with your real tests.
test('#account peeks userId and returns correct data', function(assert) {
  const service = this.subject({ store: this.store, userId: 1 });
  run(() => {
    this.user = this.store.push({
      data: {
        type: 'user',
        id: '1',
        attributes: {
          name: 'Holo'
        }
      }
    });
  });

  assert.equal(service.get('account'), this.user);
  assert.equal(service.get('account.name'), 'Holo');
});

test('#account returns null if userId doesn\'t exist', function(assert) {
  const service = this.subject();
  assert.equal(service.get('account'), null);
});
