<script>
  import { goto } from '@roxi/routify';
  import { session, redirectData } from '~/utils/store.js';

  const logout = e => {
    wretchAuth('/api/auth/session').delete().res(_ => {
      $redirectData.prevUrl = undefined;
      $session = undefined;
      $goto('/auth/session/sign-in')
    })
  }
</script>

<!-- https://codepen.io/StephenScaff/pen/bVbEbJ -->
<aside>
  <header>
    <h2 style="text-align:center; margin:0">Blangko</h2>
  </header>

  <nav>
    <ul>
      <li>
        <a href="/"><i class="ion-stats-bars"></i> <span>Dashboard</span></a>
      </li>
      <li class="has-submenu">
        <a href="#"><i class="ion-bag"></i> <span>CRUD Example</span></a>
        <ul class="nav-flyout">
          <li>
            <a href="/crud/member"><i class="ion-stats-bars"></i> <span>Data Member</span></a>
          </li>
        </ul>
      </li>
      <li class="has-submenu">
        <a href="#"><i class="ion-bag"></i> <span>Pages</span></a>
        <ul class="nav-flyout">
          <li>
            <a href="/about"><i class="ion-clipboard"></i>About</a>
          </li>
          <li>
            <a href="/contact"><i class="ion-email"></i>Contact</a>
          </li>
        </ul>
      </li>
      <li>
        <a href="#logout" on:click="{logout}"><i class="ion-log-out"></i> <span class="">Logout</span></a>
      </li>
    </ul>
  </nav>
</aside>

<style>
a {
  -webkit-transition: all 0.6s ease;
  -moz-transition: all 0.6s ease;
  transition: all 0.6s ease;
}
a:hover {
  -webkit-transition: all 0.6s ease;
  -moz-transition: all 0.6s ease;
  transition: all 0.6s ease;
}
aside {
  position: absolute;
  width: 17em;
  height: 100%;
  top: 0;
  overflow: hidden;
  background-color: #19222a;
  -webkit-transform: translateZ(0);
  visibility: visible;
  -webkit-backface-visibility: hidden;
}
header {
  background-color: #09f;
  width: 100%;
  display: block;
  padding: 0.75em 1em;
}

nav {
  position: fixed;
  background-color: #19222a;
  height: 100%;
  font-weight: 400;
  font-size: 1.2em;
  overflow: auto;
  padding-bottom: 6em;
  z-index: 9;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}
nav ul {
  list-style: none;
  display: block;
  padding: 0;
  margin: 0;
}
nav ul li {
  margin-left: 0;
  padding-left: 0;
  padding-right: 0;
  display: inline-block;
  width: 100%;
}
nav ul li a {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75em;
  padding: 1.05em 1.6em;
  margin-left: 0;
  position: relative;
  display: block;
}
nav ul li a:hover {
  background-color: rgba(0, 0, 0, 0.9);
}
nav ul li i {
  font-size: 1.8em;
  padding-right: 0.5em;
  width: 9em;
  display: inline;
  vertical-align: middle;
}
li.has-submenu > a:after {
  content: "";
  font-family: ionicons;
  font-size: 0.5em;
  width: 10px;
  color: #fff;
  position: absolute;
  right: 2.75em;
  top: 45%;
}
.nav-flyout {
  position: absolute;
  background-color: #080D11;
  z-index: 9;
  left: 7em;
  right: 0;
  top: 0;
  height: 100vh;
  -webkit-transform: translateX(100%);
  -moz-transform: translateX(100%);
  -ms-transform: translateX(100%);
  -o-transform: translateX(100%);
  transform: translateX(100%);
  -webkit-transition: all 0.5s ease;
  -moz-transition: all 0.5s ease;
  transition: all 0.5s ease;
}
.has-submenu:hover .nav-flyout {
  left: 3em;
}
.nav-flyout a:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
nav ul > li:hover .nav-flyout {
  -webkit-transform: translateX(0);
  -moz-transform: translateX(0);
  -ms-transform: translateX(0);
  -o-transform: translateX(0);
  transform: translateX(0);
  -webkit-transition: all 0.5s ease;
  -moz-transition: all 0.5s ease;
  transition: all 0.5s ease;
}
</style>
