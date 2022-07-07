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
<input type="checkbox" id="check">
<label for="check"><i class="ion-navicon-round"></i></label>

<aside class=sidebar>
  <header>
    <h2>Blangko</h2>
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

<style global>
#check {display: none;}
[class*=ion-navicon] {
  position: absolute;
  background: #042331;
  border-radius: 0 4px 4px 0;
}
[class*=ion-navicon] {
  left: 0;
  top: 10px;
  padding: 4px 9px;
  transition: all 0.5s;
}
header {
  background: #09f;
  padding: 0.75em 1em;
  height: 125px;
  text-align: center;
}
aside {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background: #19222a;
  transition: all 0.5s ease;
}
#check:checked ~ aside {left: 0;}
#check:checked ~ label [class*=ion-navicon] {left: 250px;}
#check:checked ~ label [class*=ion-navicon]:before {content: "\f129";}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0 !important;
}
nav ul li {
  margin-left: 0;
  padding-left: 0;
  padding-right: 0;
  display: inline-block;
  width: 100%;
}
nav li a {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75em;
  padding: 1.05em 1.6em;
  margin-left: 0;
  position: relative;
  width: 100%;
}
nav li a:hover {
  background: rgba(0, 0, 0, 0.9);
}
nav li i {
  font-size: 1.8em;
  padding-right: 0.5em;
  width: 9em;
  display: inline;
  vertical-align: middle;
}
nav li.has-submenu > a:after {
  content: "";
  font-family: ionicons;
  font-size: 0.5em;
  width: 10px;
  color: #fff;
  position: absolute;
  right: 2.75em;
  top: 45%;
}
nav li ul {
  position: absolute;
  background: #080D11;
  z-index: 9;
  top: 125px;
  overflow: hidden;
  width: 0;
  height: 100vh;
  opacity: 0;
  left: 258px;
  transition: 0.5s;
}
nav li:hover ul {
  left: 48px;
  width: 202px;
  opacity: 1;
}
nav li ul a:hover {
  background: rgba(255, 255, 255, 0.05);
}
@media (min-width: 550px) {
  label i {display: none;}
  aside {left: 0}
  main {margin-left: 250px}
}
@media (min-width: 580px) {
  nav li:hover ul {
    left: 54px;
    width: 196px;
  }
}
@media (min-width: 1210px) {
  nav li:hover ul {
    left: 60px;
    width: 200px;
  }
}
@media (min-width: 1160px) {
  aside {width: 280px;}
  nav li ul {left: 280px}
  nav li:hover ul {
    width: 220px;
  }
  main {margin-left: 280px;}
}
</style>
