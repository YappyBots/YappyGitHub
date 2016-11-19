let url = require('url');

class GithubRepoParser {

  constructor() {
    this.Parse = this.Parse.bind(this);
  }

  Parse(str) {
    if (typeof str !== 'string' || !str.length) return null;
    if (str.indexOf('git@gist') > -1 || str.indexOf('//gist') > -1) return null;

    let obj = url.parse(str);
    if (typeof obj.path !== 'string' || !obj.path.length ||
     typeof obj.pathname !== 'string' || !obj.pathname.length) return null;

    obj.path = this._trimSlash(obj.path);
    obj.pathname = this._trimSlash(obj.pathname);

    if (obj.path.indexOf('repos') === 0) obj.path = obj.path.slice(6);

    let seg = obj.path.split('/').filter(Boolean);
    let hasBlob = seg[2] === 'blob';

    if (hasBlob && !this._isChecksum(seg[3])) obj.branch = seg[3];

    let tree = str.indexOf('tree');
    if (tree > -1) obj.branch = str.slice(tree + 5);

    obj.owner = this._owner(seg[0]);
    obj.name = this._name(seg[1]);

    if (seg.length > 1 && obj.owner && obj.name) {
      obj.repo = `${obj.owner}/${obj.name}`;
    } else {
      let href = obj.href.split(':');

      if (href.length === 2 && obj.href.indexOf('//') === -1) {
        obj.repo = obj.repo || href[href.length - 1];
        let repoSegments = obj.repo.split('/');
        obj.owner = repoSegments[0];
        obj.name = repoSegments[1];
      } else {
        let match = obj.href.match(/\/([^\/]*)$/); // eslint-disable-line no-useless-escape
        obj.owner = match ? match[1] : null;
        obj.repo = null;
      }

      if (obj.repo && (!obj.owner || !obj.name)) {
        let segs = obj.repo.split('/');
        if (segs.length === 2) {
          obj.owner = segs[0];
          obj.name = segs[1];
        }
      }
    }

    obj.branch = obj.branch || seg[2] || this._getBranch(obj.path, obj);

    let res = {};
    res.host = obj.host || 'github.com';
    res.owner = obj.owner || null;
    res.name = obj.name || null;
    res.repo = obj.repo;
    res.repository = res.repo;
    res.branch = obj.branch;
    return res;
  }

  _isChecksum(str) {
    return /^[a-f0-9]{40}$/i.test(str);
  }

  _getBranch(str, obj) {
    var branch;
    var segs = str.split('#');
    if (segs.length !== 1) {
      branch = segs[segs.length - 1];
    }
    if (!branch && obj.hash && obj.hash.charAt(0) === '#') {
      branch = obj.hash.slice(1);
    }
    return branch || 'master';
  }

  _trimSlash(path) {
    return path.charAt(0) === '/' ? path.slice(1) : path;
  }

  _name(str) {
    return str ? str.replace(/^\W+|\.git$/g, '') : null;
  }

  _owner(str) {
    if (!str) return null;
    var idx = str.indexOf(':');
    if (idx > -1) {
      return str.slice(idx + 1);
    }
    return str;
  }

}

module.exports = new GithubRepoParser();
