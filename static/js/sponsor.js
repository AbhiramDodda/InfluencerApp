const dashboardComp = Vue.component("dashboard-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
    <div id="card_list">
      <div class="top_flex">
        <div class="sub_flex">
          <h3> Welcome {[ this.profile.name ]} </h3>
        </div>
        <div class="sub_flex">
          <router-link to="/campaign-view">
              <button class="button-2">Campaigns</button>
          </router-link>
        </div>
          <div class="sub_flex">
          <router-link to="/influencer-view">
              <button class="button-2">Influencers</button>
          </router-link>
          </div>
          <div class="sub_flex">
              <button @click="logout()" class="button-2">Logout</button>
          </div>
      </div>
      
      <div class="outline">
        <h2>Active Campaigns</h2>
        <p v-if="this.active_campaigns.length ==0">No Active Campaigns </p>
        <div v-for="campaign in this.active_campaigns" class="outline">
          <h5>{[ campaign.campaign_name ]}</h5>
          <p>{[ campaign.start_date ]}</p>
          <p>{[ campaign.end_date ]}</p>
        </div>
      </div>

      <div class="outline">
        <h2>New Requests (Received)</h2>
        <p v-if="this.new_requests.length ==0">No new requests</p>
        <div v-for="campaign in this.new_requests" class="outline">
          <h5>{[ campaign.campaign_name ]}</h5>
          <p>Sponsor: {[ campaign.sponsor_id ]}</p>
          <p>{[ campaign.start_date ]}</p>
          <p>{[ campaign.end_date ]}</p>
          <p> Amount: {[ campaign.budget ]}</p>
          <button @click="accept(campaign)" class="btn btn-primary">Accept</button>
          <button @click="reject(campaign)" class="btn btn-primary">Reject</button>
        </div>
      </div>

      <div class="outline">
        <h2>Sent Requests</h2>
        <p v-if="this.sent_requests.length ==0">No sent requests</p>
        <div v-for="campaign in this.sent_requests" class="outline">
          <h5>{[ campaign.campaign_name ]}</h5>
          <p>Sponsor: {[ campaign.sponsor_id ]}</p>
          <p>{[ campaign.start_date ]}</p>
          <p>{[ campaign.end_date ]}</p>
          <p> Amount: {[ campaign.budget ]}</p>
          <button @click="delete_request(campaign)" class="btn btn-primary">Delete</button>
          <button @click="edit_request_display(campaign)" class="btn btn-primary">Edit</button>
        </div>
      </div>
    </div>

    <div v-if="edit_req_display" class="card">
        <h3>{[ this.campaign_to_req.name ]}</h3>
        <div class="scrollable-container">
          <div v-for="influencer in this.influencers" class=scrollable-content>
            <h4>Name: {[ influencer.name ]}</h4>
            <p>Followers: {[ influencer.followers_count ]}</p>
            <p v-if="influencer.insta_link.length != 0">Instagram Link: {[ influencer.insta_link ]}</p>
            <p v-if="influencer.linkdin_link.length != 0">Linkdin Link: {[ influencer.linkdin_link ]}</p>
            <p v-if="influencer.other_link.length != 0">Other link: {[ influencer.other_link ]}</p>
            <button @click="request(influencer)">Request</button>
          </div>
        </div>
        <button @click="close_request()">Close</button>
      </div>
    `,

  // DATA
  data: function () {
    return {
      profile: "",
      active_campaigns: {},
      new_requests: {},
      sent_requests: {},
      influencers: {},
      edit_req_display: false,
      request_to_edit: "",
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
        this.sent_requests = data["sent"];
      });
    console.log(this.campaigns);
  },

  // METHODS
  methods: {
    delete_request: function (campaign) {
      const requests_url = "http://" + window.location.host + "/requests";
      fetch(requests_url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: campaign.id,
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.active_campaigns = data["active"];
        this.new_requests = data["new"];
        this.sent_requests = data["sent"];
      });
    },
    logout() {
      window.location.href = "http://" + window.location.host+"/logout";
    },
    accept: function (campaign) {
      const profile_url = "http://" + window.location.host + "/requests";
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

const influencerViewComp = Vue.component("influencer-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
  <div>
      <div class="top_flex">
        <div class="sub_flex">
          <router-link to="/">
              <button class="button-2">Home</button>
          </router-link>
        </div>
          <div class="sub_flex">
          <router-link to="/campaign-view">
              <button class="button-2">Campaigns</button>
          </router-link>
          </div>
          <div class="sub_flex">
              <button @click="logout()" class="button-2">Logout</button>
          </div>
      </div>
      <div>
        <input type="text" class="form-control" v-model="search_string" placeholder="Search campaigns" />
         <button @click="influencer_search()" class="btn btn-primary">Search</button>
        <button @click="clearSearch()" class="btn btn-secondary">Clear Search</button>
      </div>
      <div id="card_list">
        <div v-for="influencer in filteredInfluencers" class="outline">
          <h4> Name: {[ influencer.name ]}</h4>
          <h5>Email: {[ influencer.email ]}</h5>
          <button class="btn btn-primary" @click="view(influencer)">View</button>
        </div>
      </div>
      <div v-if="show_influencer">
        <div class="card">
          <div class="card-details">
              <h3 v-if="this.influencer_to_show.name.length != 0">{[ this.influencer_to_show.name ]}</h3>
              <h4>{[ this.influencer_to_show.followers ]}</h4>
              <p v-if="this.influencer_to_show.email != 0">{[ this.influencer_to_show.email ]}</p>
              <p v-if="this.influencer_to_show.insta_link != 0">{[ this.influencer_to_show.insta_link ]}</p>
              <p v-if="this.influencer_to_show.linkdin_link != 0">{[ this.influencer_to_show.linkdin_link ]}</p>
              <p v-if="this.influencer_to_show.other_link != 0">{[ this.influencer_to_show.other_link ]}</p>
              <br />
              <button class="button" @click="close()">Close</button>
          </div>
        </div>
      </div>
  </div>
        `,

  // DATA
  data: function () {
    return {
      influencers: {},
      influencer_to_show: "",
      show_influencer: false,
      search_string: "",
    };
  },

  // MOUNTED - API call
  mounted() {
    const influencer_url = "http://" + window.location.host + "/influencer-data";
    fetch(influencer_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.influencers = data["data"];
      });
  },

  // COMPUTED
  computed: {
    filteredInfluencers() {
      if (!this.search_string.trim()) {
        return this.influencers;
      }
      const search = this.search_string.toLowerCase();
      return this.influencers.filter(influencer => influencer.name.toLowerCase().includes(search));
    }
  },
  // METHODS
  methods: {
    influencer_search() {
      
    },
    logout() {
      window.location.href = "http://" + window.location.host+"/logout";
    },
    clearSearch() {
      this.search_string = "";
    },
    view: function (influencer) {
      this.influencer_to_show = influencer;
      this.show_influencer = true;
    },
    close: function () {
      this.show_influencer = false;
    },
  },
});

const campaignComp = Vue.component("campaign-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
    <div id="card_list">
    <div class="top_flex">
        <div class="sub_flex">
          <router-link to="/">
              <button class="button-2">Home</button>
          </router-link>
        </div>
          <div class="sub_flex">
          <router-link to="/influencer-view">
              <button class="button-2">Influencers</button>
          </router-link>
          </div>
          <div class="sub_flex">
              <button @click="logout()" class="button-2">Logout</button>
          </div>
      </div>
      <div>
        <input type="text" class="form-control" v-model="search_string" />
        <button @click="influencer_search()" class="btn btn-primary">Search</button>
      </div>
      <div v-for="campaign in this.campaigns" class="outline">
        <h4>{[ campaign.name ]}</h4>
        <p> {[ campaign.description ]}</p>
        <h5> Start date: {[ campaign.start_date ]} | End date: {[ campaign.end_date ]} </h5>
        <h5> Budget: {[ campaign.budget ]} </h5>
        <p v-if="campaign.flagged == 1">Campaign flagged by Admin</p>
        <button class="btn btn-primary" @click="request_inf_view(campaign)">Request</button>
        <button class="btn btn-primary" @click="edit_campaign_display(campaign)">Edit Campaign</button>
        <button class="btn btn-primary" @click="delete_campaign(campaign)">Delete Campaign</button>
      </div>
      <button @click="add_campaign()" class="btn btn-primary">Add Campaign</button>

      <div v-if="inf_req_display" class="card">
        <h3>{[ this.campaign_to_req.name ]}</h3>
        <div class="scrollable-container">
          <div v-for="influencer in this.influencers" class=scrollable-content>
            <h4>Name: {[ influencer.name ]}</h4>
            <p>Followers: {[ influencer.followers_count ]}</p>
            <p v-if="influencer.insta_link.length != 0">Instagram Link: {[ influencer.insta_link ]}</p>
            <p v-if="influencer.linkdin_link.length != 0">Linkdin Link: {[ influencer.linkdin_link ]}</p>
            <p v-if="influencer.other_link.length != 0">Other link: {[ influencer.other_link ]}</p>
            <button @click="request(influencer)">Request</button>
          </div>
        </div>
        <button @click="close_request()">Close</button>
      </div>

      <div id="pop-up-category" class="pop-up" v-if="display_add_cam_form">
        <div class="mb-3">
          <label for="exampleInputEmail1" class="form-label">Campaign name</label>
          <input
            type="text"
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="campaign_name"
          />

          <label for="exampleInputEmail1" class="form-label">Description</label>
          <textarea
            type="text"
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="campaign_description"
          ></textarea>

          <label for="exampleInputEmail1" class="form-label">Visibility</label>
          <label>
              <input type="radio" value="PRIVATE" v-model="campaign_visibility">
              Private
          </label>
          <label>
              <input type="radio" value="PUBLIC" v-model="campaign_visibility">
              public
          </label>

          <label for="exampleInputEmail1" class="form-label">Budget</label>
          <input type="number" id="number-input" v-model.number="campaign_budget">

          <label for="start-date">Select a start date:</label>
          <input type="date" id="start-date" name="start-date" v-model="start_date">

          <label for="start-date">Select an end date:</label>
          <input type="date" id="end-date" name="end-date" v-model="end_date">
          
        </div>
        <button @click="add_new_campaign()" class="btn btn-primary">Add</button>
      </div>

      <div id="pop-up-category" class="pop-up" v-if="display_edit_cam_form">
        <div class="mb-3">
          <label for="exampleInputEmail1" class="form-label">Campaign name</label>
          <input
            type="text"
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="campaign_name"
          />

          <label for="exampleInputEmail1" class="form-label">Description</label>
          <textarea
            type="text"
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            v-model="campaign_description"
          ></textarea>

          <label for="exampleInputEmail1" class="form-label">Visibility</label>
          <label>
              <input type="radio" value="PRIVATE" v-model="campaign_visibility">
              Private
          </label>
          <label>
              <input type="radio" value="PUBLIC" v-model="campaign_visibility">
              public
          </label>

          <label for="exampleInputEmail1" class="form-label">Budget</label>
          <input type="number" id="number-input" v-model.number="campaign_budget">

          <label for="start-date">Select a start date:</label>
          <input type="date" id="start-date" name="start-date" v-model="start_date">

          <label for="start-date">Select an end date:</label>
          <input type="date" id="end-date" name="end-date" v-model="end_date">
          
        </div>
        <button @click="edit_campaign()" class="btn btn-primary">Edit</button>
      </div>
    </div>
    `,

  // DATA
  data: function () {
    return {
      id: "",
      campaigns: {},
      campaign_name: "",
      campaign_visibility: "",
      campaign_description: "",
      campaign_budget: "",
      start_date: "",
      end_date: "",
      display_add_cam_form: false,
      campaign_to_req: "",
      inf_req_display: false,
      influencers: {},
      display_edit_cam_form: false,
      search_string: "",
    };
  },

  // MOUNTED - API call
  mounted() {
    const campaign_crud_url = "http://" + window.location.host + "/campaign";
    const influencers_url = "http://" + window.location.host + "/influencer-data"
    fetch(influencers_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      this.influencers = data["data"];
    });
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
    close_request: function () {
      this.inf_req_display = false;
    },
    request_inf_view: function (campaign) {
      this.campaign_to_req = campaign;
      this.inf_req_display = true;
    },
    request: function(influencer) {
      this.inf_req_display = false;
      const requests_url = "http://" + window.location.host + "/requests";
      fetch(requests_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          influencer_id: influencer.email,
          campaign_id: this.campaign_to_req.id,
        }),
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("ok");
      });
    },
    add_campaign: function () {
      this.display_add_cam_form = true;
    },
    edit_campaign_display: function (campaign) {
      this.id = campaign.id;
      this.campaign_name = campaign.name;
      this.campaign_description = campaign.description;
      this.campaign_visibility = campaign.visibility;
      this.campaign_budget = campaign.budget;
      this.start_date = campaign.start_date;
      this.end_date = campaign.end_date;
      this.display_edit_cam_form = true;
    },
    edit_campaign: function (cam_id) {
      this.display_edit_cam_form = false;
      const campaign_crud_url = "http://" + window.location.host + "/campaign";
      fetch(campaign_crud_url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: this.id,
          campaign_name: this.campaign_name,
          campaign_description: this.campaign_description,
          campaign_budget: this.campaign_budget,
          start_date: this.start_date,
          end_date: this.end_date,
          campaign_visibility: this.campaign_visibility,
        }),
      }).then((response) => {
        this.campaign_name = "";
        this.campaign_description = "";
        this.campaign_budget = "";
        this.campaign_visibility = "";
        this.end_date = "";
        this.start_date = "";
      });
    },
    delete_campaign: function (campaign) {
      const campaign_crud_url = "http://" + window.location.host + "/campaign";
      fetch(campaign_crud_url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: campaign.id,
        }),
      }).then((response) => {
        if (response.ok) {
          return response.json()
        }
      }).then((data) => {
        this.campaigns = data['data'];
      });
    },
    add_new_campaign: function () {
      const campaign_crud_url = "http://" + window.location.host + "/campaign";
      this.display_add_cam_form = false;
      fetch(campaign_crud_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_name: this.campaign_name,
          campaign_description: this.campaign_description,
          campaign_budget: this.campaign_budget,
          start_date: this.start_date,
          end_date: this.end_date,
          campaign_visibility: this.campaign_visibility,
        }),
      }).then((response) => {
        if (response.ok) {
          this.campaign_name = "";
          this.campaign_description = "";
          this.campaign_budget = "";
          this.campaign_visibility = "";
          this.end_date = "";
          this.start_date = "";
          return response.json()
          
        }
      }).then((data) => {
        this.campaigns = data['data'];
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
    path: "/influencer-view",
    component: influencerViewComp,
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
