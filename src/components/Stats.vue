// Modified; original by hydrabolt

<template>
  <slide>
    <h2>Stats</h2>
    <div class="stat"><b>{{ stars }}</b> stars</div>
    <div class="stat"><b>{{ contributors }}</b> contributors</div>
  </slide>
</template>
<script>

const request = require('superagent');

const data = {
  stars: '2+ ',
  contributors: '1+ ',
};

function load() {
  request
    .get('https://api.github.com/repos/datitisev/DiscordBot-Yappy')
    .end((err, res) => {
      if (!err) {
        data.stars = `${res.body.stargazers_count}`.toLocaleString();
      }
    });

  request
    .get('https://api.github.com/repos/datitisev/DiscordBot-Yappy/contributors')
    .end((err, res) => {
      if (!err) {
        data.contributors = `${res.body.length}`.toLocaleString();
      }
    });
}

export default {
  data() {
    load();
    return data;
  },
};
</script>
