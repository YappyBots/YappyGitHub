const trello = require('node-trello');
const Trello = new trello('757b8b7388014629fc1e624bde8cc600', process.env.TRELLO_TOKEN);
const Collection = require('./Collection');
const Log = require('./Logger').Logger;

const board = 'YC5ZhyHZ';
const boardId = '57b811ebb57c4ff8f460ae03';

class Cache {
  constructor() {
    this.lists = new Collection();
    this.cards = new Collection();
    this.comments = new Collection();
    this.actions = new Collection();

    this.init();
  }

  init() {
    // initialize data
    Trello.get(`/1/boards/${board}/cards`, {
      fields: ['id', 'name', 'desc', 'idList']
    }, (err, res) => {
      if (err) return Log.error(err);
      var cards = res.reverse();

      cards.forEach(card => {
        this.cards.set(card.id, card);
      });
    });

    Trello.get(`/1/boards/${board}/cards`, {
      fields: ['id', 'name'],
      actions: ['commentCard']
    }, (err, res) => {
      if (err) return Log.error(err);
      var cards = res.reverse();

      cards.forEach(card => {
        card.actions.filter(e => e.type === 'commentCard').forEach(comment => {
          this.comments.set(comment.id, comment);
        });
      });
    });
  }

  // CARDS
  Cards() {
    return new Promise(resolve => {
      resolve(this.cards.array());
    });
  }
  GetCard(id) {
    return new Promise(resolve => {
      resolve(this.cards.get(id));
    });
  }
  AddCard(id, info) {
    return new Promise((resolve, reject) => {
      if (this.cards.find('id', id)) return reject(`Card with id ${id} already exists!`);

      this.cards.set(id, info);

      resolve(info);
    });
  }
  UpdateCard(id, newInfo) {
    return new Promise((resolve, reject) => {
      let card = this.cards.find(id);

      if (!card) return this.AddCard(id, newInfo).resolve(resolve).reject(reject);

      Promise.resolve(Object.keys(newInfo).forEach(key => {
        card[key] = newInfo[key];
      })).then(() => {
        this.cards.set(id, card);
        resolve(card);
      });

    });
  }
  DeleteCard(id) {
    return new Promise((resolve, reject) => {
      let card = this.cards.find(id);

      if (!card) return reject(`Could not find card with id ${id} in cache!`);

      this.cards.delete(id);
      resolve();
    });
  }

  // COMMENTS
  get Comments() {
    return new Promise(resolve => {
      resolve(this.comments.array());
    });
  }
  GetComment(id) {
    return new Promise(resolve => {
      resolve(this.comments.get(id));
    });
  }

  // OTHER
  Search(query, model = 'all') {
    return new Promise((resolve, reject) => {
      Trello.get('/1/search', {
        query,
        modelTypes: model,
        idBoards: [ boardId ]
      }, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
  Members(opts = {}) {
    return new Promise((resolve, reject) => {
      Trello.get(`/1/boards/${boardId}/members`, opts, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }
}

module.exports = new Cache();
