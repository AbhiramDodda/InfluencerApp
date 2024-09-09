const barChartComp = Vue.component('bar-chart', {
  template: '<canvas id="barChart"></canvas>',
  data() {
    return {
      chartData: null
    };
  },
  mounted() {
    const stats_url = "http://" + window.location.host + "/stats"
        fetch(stats_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            required: 'bar-chart',
          })
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data['data']);
            this.chartData = data["data"];
            this.renderChart();
          });
  },
  methods: {
    renderChart() {
      var ctx = document.getElementById('barChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            label: 'Monthly Sales',
            data: this.chartData.values,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
});

const pieChartComp = Vue.component('pie-chart', {
  template: '<canvas id="pieChart"></canvas>',
  data() {
    return {
      chartData: null
    };
  },
  mounted() {
    const stats_url = "http://" + window.location.host + "/stats"
        fetch(stats_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            required: 'pie-chart',
          })
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            console.log(data['data']);
            this.chartData = data["data"];
            this.renderChart();
          });
  },
  methods: {
    renderChart() {
      var ctx = document.getElementById('pieChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: this.chartData.labels,
          datasets: [{
            label: 'My Pie Chart',
            data: this.chartData.values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        }
      });
    }
  }
});


const dashboardComp = Vue.component("dashboard-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
      <div id="card_list">
      <div class="top_flex">
        <div class="sub_flex">
          <h1>Welcome Admin</h1>
        </div>
        <div class="sub_flex">
          <router-link to="/influencer-view">
              <button class="button-2">Influencers</button>
          </router-link>
        </div>
        <div class="sub_flex">
          <router-link to="/campaign-view">
              <button class="button-2">Campaigns</button>
          </router-link>
        </div>
        <div class="sub_flex">
          <router-link to="/sponsor-view">
              <button class="button-2">Sponsors</button>
          </router-link>
        </div>
        <div class="sub_flex">
            <button @click="logout()" class="button-2">Logout</button>
        </div>
      </div>
      <div class="outline">
        <h2>Approval Requests</h2>
        <p v-if="this.approval_requests.length == 0">No approval requests</p>
        <div v-for="request in this.approval_requests" class="list_item_container">
          <h5>Email: {[ request[0] ]}</h5>
          <button class="btn btn-primary" @click="accept_request(request)">Approve</button>
          <button class="btn btn-primary" @click="reject_request(request)">Reject</button>
        </div>
      </div>
        <div style="width: 1000px; height: 850px;">
          <bar-chart></bar-chart>
        </div>
        <div style="width: 1000px; height: 850px;">
          <pie-chart></pie-chart>
        </div>
      </div>
      `,

  // DATA
  data: function () {
    return {
      approval_requests: {},
    };
  },

  // MOUNTED - API call
  mounted() {
    const approval_crud_url =
      "http://" + window.location.host + "/admin-approval";
    fetch(approval_crud_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.approval_requests = data["data"];
      });
    console.log(this.approval_requests);
  },

  // METHODS
  methods: {
    logout() {
      // Clear the JWT token from cookies
      window.location.href = "http://" + window.location.host+"/logout";
    },
    accept_request: function (request) {
      const approval_crud_url =
        "http://" + window.location.host + "/admin-approval";
      fetch(approval_crud_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: request[0] }),
      }).then((response) => {
        return response.json();
      })
      .then((data) => {
        this.approval_requests = data['data'];
      });
    },

    reject_request: function (request) {
      const approval_crud_url =
        "http://" + window.location.host + "/admin-approval";
      fetch(approval_crud_url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: request[0] }),
      }).then((response) => {
        return response.json();
      })
      .then((data) => {
        this.approval_requests = data['data'];
      });
    },
    reloadComponenet: function () {
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

const influencerViewComp = Vue.component("influencer-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
  <div>
      <div>
        <router-link to="/">
            <button class="button">Home</button>
        </router-link>
        <router-link to="/campaign-view">
            <button class="button">Campaigns</button>
        </router-link>
        <router-link to="/sponsor-view">
            <button class="button">Sponsors</button>
        </router-link>
        
            <button @click="logout()" class="button">Logout</button>
        
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
          <button class="btn btn-primary" @click="remove(influencer)">Delete</button>
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

  // METHODS
  methods: {
    logout() {
      window.location.href = "http://" + window.location.host+"/logout";
    },
    influencer_search() {
      // The search functionality is handled by the computed property 'filteredCampaigns'
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
    remove: function (influencer) {
      if (confirm("Do you want to delete the influencer" + influencer.name) == true){
        const influencer_url = "http://" + window.location.host + "/influencer-data";
        fetch(influencer_url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: influencer.email,
          })
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.influencers = data["data"];
          });
      }
    }
  },
});

const sponsorViewComp = Vue.component("sponsor-component", {
  // DELIMITERS
  delimiters: ["{[", "]}"],

  // TEMPLATE
  template: `
  <div>
      <div>
        <router-link to="/">
            <button class="button">Home</button>
        </router-link>
        <router-link to="/campaign-view">
            <button class="button">Campaigns</button>
        </router-link>
        <router-link to="/influencer-view">
            <button class="button">Influencers</button>
        </router-link>
        
            <button @click="logout()" class="button">Logout</button>
        
      </div>
      <div>
        <input type="text" class="form-control" v-model="search_string" placeholder="Search campaigns" />
        <button @click="clearSearch()" class="btn btn-secondary">Clear Search</button>
      </div>
      <div id="card_list">
        <div v-for="sponsor in filteredInfluencers" class="outline">
          <h4> Name: {[ sponsor.name ]}</h4>
          <h5>Email: {[ sponsor.email ]}</h5>
          <button class="btn btn-primary" @click="remove(sponsor)">Delete</button>
        </div>
      </div>
  </div>
        `,

  // DATA
  data: function () {
    return {
      sponsors: {},
      search_string: "",
    };
  },

  // MOUNTED - API call
  mounted() {
    const sponsor_url = "http://" + window.location.host + "/sponsor-data";
    fetch(sponsor_url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.sponsors = data["data"];
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
    remove: function (influencer) {
      if (confirm("Do you want to delete the sponsor" + influencer.name) == true){
        const influencer_url = "http://" + window.location.host + "/sponsor-data";
        fetch(influencer_url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: influencer.email,
          })
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.sponsors = data["data"];
          });
      }
    }
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
        <router-link to="/influencer-view">
            <button class="button">Influencers</button>
        </router-link>
        <router-link to="/sponsor-view">
            <button class="button">Sponsors</button>
        </router-link>
       
            <button @click="logout()" class="button">Logout</button>
        
      </div>
      <div>
        <input type="text" class="form-control" v-model="search_string" placeholder="Search campaigns" />
         <button @click="influencer_search()" class="btn btn-primary">Search</button>
        <button @click="clearSearch()" class="btn btn-secondary">Clear Search</button>
      </div>
      <div v-for="campaign in filteredCampaigns" class="outline">
        <h5>{[ campaign.name ]}</h5>
        <p v-if="campaign.flagged == 1">Flagged campaign</p>
        <button class="btn btn-primary" @click="view_campaign(campaign)">View</button>
        <button class="btn btn-primary" @click="delete_campaign(campaign)">Delete</button>
        <button class="btn btn-primary" @click="flag_campaign(campaign)">Flag</button>
      </div>
      <div id="pop-up-category" class="pop-up" v-if="display_campaign">
        <div class="mb-3">
          <h3>Name: {[ this.campaign_to_view.name ]}</h3>
          <h4>Budget: {[ this.campaign_to_view.budget ]}</h4>
          <p>Start date: {[ this.campaign_to_view.start_date ]}  End date: {[ this.campaign_to_view.end_date ]}</p>
          <p> Sponsor: {[ this.campaign_to_view.sponsor_id ]}</p>
        </div>
        <button @click="close()" class="btn btn-primary">Close</button>
        <button @click="request_campaign(this.campaign_to_view)" class="btn btn-primary">Request</button>
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
    influencer_search() {
    },
    view_campaign: function (campaign) {
      this.campaign_to_view = campaign;
      this.display_campaign = true;
    },
    delete_campaign: function (campaign) {
      const request_url = "http://" + window.location.host + "/campaign";
      fetch(request_url, {
        method: "DELETE",
        headers: {
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          id: campaign.id,
        })
      })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.campaigns = data["data"];
      });
    },
    close: function (){
      this.display_campaign = false;
    },
    flag_campaign: function(campaign) {
      const flag_url = "http://" + window.location.host + "/campaign-flag";
      fetch(flag_url, {
        method: "POST",
        headers: {
          'Content-Type': "application/json",
        },
        body: JSON.stringify({
          id: campaign.id,
        })
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
  {
    path: "/sponsor-view",
    component: sponsorViewComp,
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
