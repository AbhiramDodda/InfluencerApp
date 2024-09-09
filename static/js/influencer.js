const dashboardComp = Vue.component("dashboard-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
    <div id="card_list">
      <div>
        <router-link to="/campaign-view">
            <button class="button">Campaigns</button>
        </router-link>  
        <button @click="logout()" class="button">Logout</button>
        
      </div>

      <div class="outline" v-if="edit_profile_flag">
        <h1> Welcome {[ this.profile.name ]} </h1>
        <h3> Followers: {[ this.profile.followers_count ]}</h3>
        <h3> Instagram Link: {[ this.profile.insta_link ]}</h3>
        <h3> Linkdin Link: {[ this.profile.linkdin_link ]}</h3>
        <h3> Other Link: {[ this.profile.other_link ]}</h3>
        <button @click="enable_edit_profile()" class="button-2">Edit Profile</button>
      </div>
      <div class="outline" v-if="!edit_profile_flag">
        <label>Name:</label>
        <input v-model="profile.name" type="text">
        <label>Followers Count:</label>
        <input v-model="profile.followers_count" type="text">
        <label>Instagram Link:</label>
        <input v-model="profile.insta_link" type="text">
        <label>Linkdin Link:</label>
        <input v-model="profile.linkdin_link" type="text">
        <label>Other Link:</label>
        <input v-model="profile.other_link" type="text">
        <button @click="edit_profile()" class="button-2">Edit</button>
      </div>

      <div class="outline">
        <h2>Active Campaigns</h2>
        <p  v-if="this.active_campaigns.length == 0"> No active campaigns</p>
        <div v-for="campaign in this.active_campaigns" class="outline">
          <h5>{[ campaign.campaign_name ]}</h5>
          <p>{[ campaign.start_date ]}</p>
          <p>{[ campaign.end_date ]}</p>
        </div>
      </div>

      <div class="outline">
        <h2>New Requests</h2>
        <p  v-if="this.new_requests.length == 0"> No new requests</p>
        <div v-for="campaign in this.new_requests" class="outline">
          <h5>{[ campaign.campaign_name ]}</h5>
          <p>Sponsor: {[ campaign.sponsor_id ]}</p>
          <p>{[ campaign.start_date ]}</p>
          <p>{[ campaign.end_date ]}</p>
          <button @click="accept(campaign)" class="btn btn-primary">Accept</button>
          <button @click="reject(campaign)" class="btn btn-primary">Reject</button>
        </div>
      </div>
    </div>
    `,

  // DATA
  data: function () {
    return {
      profile: "",
      active_campaigns: {},
      new_requests: {},
      edit_profile_flag: true,
    };
  },

  // MOUNTED - API call
  mounted() {
    const requests_crud_url = "http://" + window.location.host + "/requests";
    const profile_url = "http://" + window.location.host + "/profile"
    fetch(profile_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.profile = data["data"];
      });
    fetch(requests_crud_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.active_campaigns = data["active"];
        this.new_requests = data["new"];
      });
    console.log(this.campaigns);
  },

  // METHODS
  methods: {
    enable_edit_profile(){
      this.edit_profile_flag = false; 
    },
    edit_profile: function(){
      const influencer_crud_url = "http://" + window.location.host+"/influencer-data";
      console.log(this.profile);
      fetch(influencer_crud_url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          influencer: this.profile,
        })
      });
      this.edit_profile_flag = true;
    },
    logout() {
      window.location.href = "http://" + window.location.host+"/logout";
    },
    accept: function (campaign) {
      const profile_url = "http://" + window.location.host + "/requests"
    fetch(profile_url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: campaign.id,
        status: "accept",
      })
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.active_campaigns = data["active"];
        this.new_requests = data["new"];
      });
    },
    // REJECT
    reject: function (campaign) {
      const profile_url = "http://" + window.location.host + "/requests"
    fetch(profile_url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: campaign.id,
        status: "reject",
      })
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.active_campaigns = data["active"];
        this.new_requests = data["new"];
      });
    },
  },
});

const campaignComp = Vue.component("campaign-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
    <div id="card_list">
    <div>
        <router-link to="/">
            <button class="button">Home</button>
        </router-link>
        <router-link to="/logout">
            <button @click="logout()" class="button">Logout</button>
        </router-link>
      </div>
      <div>
        <input type="text" class="form-control" v-model="search_string" />
        <button @click="influencer_search()" class="btn btn-primary">Search</button>
      </div>
      <div v-for="campaign in filteredCampaigns" class="outline">
        <h4>{[ campaign.name ]}</h4>
        <p> {[ campaign.description ]}</p>
        <h5> Amount: {[campaign.budget ]}</h5>
        <h5> Start date: {[ campaign.start_date ]} | End date: {[ campaign.end_date ]} </h5>
        <p v-if="campaign.flagged === 1">Campaign flagged by Admin</p>
        <button class="btn btn-primary" @click="view_campaign(campaign)">View</button>
        <button class="btn btn-primary" @click="request_campaign(campaign)">Request</button>
      </div>
      <div id="pop-up-category" class="pop-up" v-if="display_campaign">
        <div class="mb-3">
          <h3>Name: {[ this.campaign_to_view.name ]}</h3>
          <h4>Budget: {[ this.campaign_to_view.budget ]}</h4>
          <p>Start date: {[ this.campaign_to_view.start_date ]}  End date: {[ this.campaign_to_view.end_date ]}</p>
          <p> Sponsor: {[ this.campaign_to_view.sponsor_id ]}</p>
          <label>Desired amount for bargain</label>
          <input v-model="bargain_amt" />
        </div>
        <button @click="close()" class="btn btn-primary">Close</button>
        <button @click="request_campaign('from_view')" class="btn btn-primary">Request</button>
      </div>
    </div>
    `,

  // DATA
  data: function () {
    return {
      campaign_to_view: "",
      display_campaign: false,
      campaigns: {},
      search_string: "",
      bargain_amt: "",
    };
  },

  computed: {
    filteredCampaigns() {
      if (!this.search_string.trim()) {
        return this.campaigns;
      }
      const search = this.search_string.toLowerCase();
      return this.campaigns.filter(campaign => campaign.name.toLowerCase().includes(search));
    }
  },

  // MOUNTED - API call
  mounted() {
    const campaign_crud_url = "http://" + window.location.host + "/campaign";
    fetch(campaign_crud_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.campaigns = data["data"];
      });
    console.log(this.campaigns);
  },

  // METHODS
  methods: {
    logout() {
      window.location.href = "http://" + window.location.host+"/logout";
    },
    view_campaign: function (campaign) {
      console.log(campaign);
      this.campaign_to_view = campaign;
      this.bargain_amt = campaign.budget;
      this.display_campaign = true;
    },
    request_campaign: function (campaign) {
      if (campaign === 'from_view') {
        campaign = this.campaign_to_view;
      }
      console.log(campaign);
      console.log(this.campaign_to_view);
      const request_url = "http://" + window.location.host + "/requests";
      fetch(request_url, {
        method: "POST",
        headers: {
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          bargain_amt: this.bargain_amt,
        })
      })
      .then((response) => {
        this.bargain_amt = "";
        return response.json();
      })
      .then((data) => {
        console.log('ok');
      });
    },
    close: function (){
      this.display_campaign = false;
    },
    reloadComponent: function () {
      const campaign_crud_url = "http://" + window.location.host + "/campaign";
      fetch(campaign_crud_url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          this.campaigns = data["data"];
        });
    },
  },
});


// Routers
const routes = [
  {
    path: "/",
    component: dashboardComp,
  },
  {
    path: "/campaign-view",
    component: campaignComp,
  },
  
];

// Router
const router = new VueRouter({
  routes: routes,
});

// App
const app = new Vue({
  delimiters: ["{[", "]}"],
  el: "#app",
  router: router,
  data: {
    message: "Vue loaded",
  },
});
