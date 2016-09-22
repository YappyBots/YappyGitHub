const CreateBranch = payload => {
  let actor = payload.sender;
  let branch = payload.ref;
  let origin_branch = payload.master_branch;

  return `🌲 **${actor.login}** created branch \`${payload.ref}\` (from _${origin_branch}_)`;
}
const DeleteBranch = payload => {
  let actor = payload.sender;
  let branch = payload.ref;

  return `🌲 **${actor.login}** deleted branch \`${branch}\``;
}

module.exports = (action, payload) => {
  if (payload.ref_type !== 'branch') return false;

  switch (action) {
    case 'create': {
      return CreateBranch(payload);
      break;
    }
    case 'delete': {
      return DeleteBranch(payload);
      break;
    }
  }
}
