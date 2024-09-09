// Influencer Signup Component
const influencerSignUpComp = Vue.component("influencer-signup", {
  delimiters: ["{[", "]}"],
  template: `
    <div class="form-container">
      <h3>Influencer Signup</h3>
      <p v-if="invalid_login">Invalid credentials</p>
      <p v-if="approval">Awaiting Approval</p>
      <div class="mb-3">
        <label for="InputEmail1" class="form-label">E-mail</label>
        <input type="text" class="form-control" id="InputEmail1" aria-describedby="emailHelp" name="username" v-model="email" />
      </div>
      <div class="mb-3">
        <label for="InputPassword1" class="form-label">Password</label>
        <input type="password" class="form-control" id="InputPassword1" name="password" v-model="password" />
      </div>
      <div class="mb-3">
        <label for="InputName" class="form-label">Name</label>
        <input type="text" class="form-control" id="InputName" name="name" v-model="name" />
      </div>
      <div class="mb-3">
        <label for="InputFollowers" class="form-label">Followers</label>
        <input type="text" class="form-control" id="InputFollowers" name="followers" v-model="followers" />
      </div>
      <div class="mb-3">
        <label for="InputInstaLink" class="form-label">Instagram Link</label>
        <input type="text" class="form-control" id="InputInstaLink" name="insta_link" v-model="insta_link" />
      </div>
      <div class="mb-3">
        <label for="InputLinkedInLink" class="form-label">LinkedIn Link</label>
        <input type="text" class="form-control" id="InputLinkedInLink" name="linkdin_link" v-model="linkdin_link" />
      </div>
      <div class="mb-3">
        <label for="InputOtherLink" class="form-label">Any other link</label>
        <input type="text" class="form-control" id="InputOtherLink" name="other_link" v-model="other_link" />
      </div>
      <button @click="submit" class="button">Signup</button>
    </div>
  `,
  data: function() {
    return {
      loading: false,
      invalid_login: false,
      email: "",
      password: "",
      role: "INFLUENCER",
      approval: false,
      name: "",
      insta_link: "",
      linkdin_link: "",
      other_link: "",
      followers: ""
    };
  },
  methods: {
    emailCheck(mail) {
      this.username_length_incorrect = false;
      this.password_length_incorrect = false;
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
      } else {
        alert("invalid email address");
        return false;
      }
    },
    setCookie(cname, cvalue, exhours) {
      const d = new Date();
      d.setTime(d.getTime() + exhours * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    submit() {
      const signup_validate_url = "http://" + window.location.host + "/signup_validate";
      const dashboard_url = "http://" + window.location.host + "/dashboard";
      if (this.emailCheck(this.email) && this.password.length >= 8) {
        fetch(signup_validate_url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            email: this.email
          }
        })
        .then((response) => {
          if (!response.ok) {
            console.log("Response not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (!data["user_exists"]) {
            fetch(signup_validate_url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: this.email,
                password: this.password,
                role: this.role,
                name: this.name,
                followers: this.followers,
                insta_link: this.insta_link,
                linkdin_link: this.linkdin_link,
                other_link: this.other_link
              })
            })
            .then((response) => {
              if (!response.ok) {
                console.log("Response not ok");
              }
              return response.json();
            })
            .then((data) => {
              if (data["active"] == 0) {
                this.approval = true;
              } else if (data["valid_signup"]) {
                if (!data["unknown_error"]) {
                  this.setCookie("auth_token", data["auth_token"], 1);
                  console.log(data["token"]);
                  window.location.href = dashboard_url;
                }
              }
            });
          }
        });
      } else {
        this.invalid_login = true;
      }
    }
  }
});

// Sponsor Signup Component
const sponsorSignUpComp = Vue.component("sponsor-signup", {
  delimiters: ["{[", "]}"],
  template: `
    <div class="form-container">
      <h3>Sponsor Signup</h3>
      <p v-if="invalid_login">Invalid credentials</p>
      <p v-if="approval">Awaiting Approval</p>
      <div class="mb-3">
        <label for="InputEmail1" class="form-label">E-mail</label>
        <input type="text" class="form-control" id="InputEmail1" aria-describedby="emailHelp" name="username" v-model="email" />
      </div>
      <div class="mb-3">
        <label for="InputPassword1" class="form-label">Password</label>
        <input type="password" class="form-control" id="InputPassword1" name="password" v-model="password" />
      </div>
      <div class="mb-3">
        <label for="InputName" class="form-label">Name</label>
        <input type="text" class="form-control" id="InputName" name="name" v-model="name" />
      </div>
      <div class="mb-3">
        <label for="InputCategory" class="form-label">Category</label>
        <input type="text" class="form-control" id="InputCategory" name="category" v-model="category" />
      </div>
      <button @click="submit" class="button">Signup</button>
    </div>
  `,
  data: function() {
    return {
      loading: false,
      invalid_login: false,
      email: "",
      password: "",
      role: "SPONSOR",
      approval: false,
      category: "",
      name: ""
    };
  },
  methods: {
    emailCheck(mail) {
      this.username_length_incorrect = false;
      this.password_length_incorrect = false;
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
      } else {
        alert("invalid email address");
        return false;
      }
    },
    setCookie(cname, cvalue, exhours) {
      const d = new Date();
      d.setTime(d.getTime() + exhours * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    submit() {
      const signup_validate_url = "http://" + window.location.host + "/signup_validate";
      const dashboard_url = "http://" + window.location.host + "/dashboard";
      if (this.emailCheck(this.email) && this.password.length >= 8) {
        fetch(signup_validate_url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            email: this.email
          }
        })
        .then((response) => {
          if (!response.ok) {
            console.log("Response not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (!data["user_exists"]) {
            fetch(signup_validate_url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: this.email,
                password: this.password,
                role: this.role,
                name: this.name,
                category: this.category,
              })
            })
            .then((response) => {
              if (!response.ok) {
                console.log("Response not ok");
              }
              return response.json();
            })
            .then((data) => {
              if (data["active"] == 0) {
                this.approval = true;
              } else if (data["valid_signup"]) {
                if (!data["unknown_error"]) {
                  this.setCookie("auth_token", data["auth_token"], 1);
                  console.log(data["token"]);
                }
              }
            });
          }
        });
      } else {
        this.invalid_login = true;
      }
    }
  }
});

// Intro Component
const introComp = Vue.component("intro-comp", {
  delimiters: ["{[", "]}"],
  template: `
    <div>
      <div>
        <h3>Publicity</h3>
      </div>
      <div class="button-container">
        <router-link to="/influencer-signup">
          <button class="button">Influencer Signup</button>
        </router-link>
        <router-link to="/sponsor-signup">
          <button class="button">Sponsor Signup</button>
        </router-link>
        <router-link to="/login">
          <button class="button">Login</button>
        </router-link>
      </div>
    </div>
  `,
});

// LOGIN COMPONENT
const loginComp = Vue.component("login", {
  // DELIMITERS
  delimiters: ["{[", "]}"],
  // TEMPLATE
  template: `
          <div>
              <div class="mb-3">
              <h2>Login</h2>
              <p v-if="invalid_login">Invalid credentials</p>
              <p v-if="approval">Awaiting Approval</p>
                <label for="exampleInputEmail1" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  name="username"
                  v-model="email"
                />
              </div>
              <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="exampleInputPassword1"
                  name="password"
                  v-model="password"
                />
              </div>
              <button @click=submit() class="btn btn-primary">Login</button>
              <router-link to="/influencer-signup">
                      <button class="button">Influencer Signup</button>
                  </router-link>
                  <router-link to="/sponsor-signup">
                      <button class="button">Sponsor Signup</button>
                  </router-link>
          </div>
    `,

  // DATA
  data: function () {
    return {
      loading: false,
      invalid_login: false,
      email: "",
      password: "",
      approval: false,
    };
  },
  // METHODS
  methods: {
    emailCheck: function (mail) {
      this.username_length_incorrect = false;
      this.password_length_incorrect = false;
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return true;
      } else {
        alert("invalid email address");
        return false;
      }
    },
    setCookie: function (cname, cvalue, exhours) {
      const d = new Date();
      d.setTime(d.getTime() + exhours * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    submit: function () {
      const login_validate_url =
        "http://" + window.location.host + "/login_validate";
      const dashboard_url = "http://" + window.location.host + "/dashboard";
      if (this.emailCheck(this.email) && this.password.length >= 8) {
        fetch(login_validate_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              console.log("Response not ok");
            }
            return response.json();
          })
          .then((data) => {
            if(!data["valid_login"]) {
              this.invalid_login = true;
            }
            else if (!data["approval"]) {
              this.approval = true;
            } else if (data["valid_login"]) {
              console.log("Valid login");
              this.setCookie("auth_token", data["auth_token"], 1);

              window.location.href = dashboard_url;
            }
          });
      } 
    },
  },
});

const routes = [
  {
    path: "/",
    component: introComp,
  },
  {
    path: "/login",
    component: loginComp,
  },
  {
    path: "/influencer-signup",
    component: influencerSignUpComp,
  },
  {
    path: "/sponsor-signup",
    component: sponsorSignUpComp,
  },
];

const router = new VueRouter({
  routes: routes,
});

const app = new Vue({
  delimiters: ["{[", "]}"],
  el: "#app",
  router: router,
  data: {
    message: "Vue loaded",
  },
});
