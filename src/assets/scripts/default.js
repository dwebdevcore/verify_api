'use strict';
const apiDisabled = false;

const clearChildren = function() {
  var $options = document.querySelectorAll('input[type="checkbox"].category');
  for(var i = 0; i< $options.length; i++) {
    $options[i].addEventListener( 'change', function() {
        if(this.checked) {
        } else {
          var $childOptions = document.querySelectorAll(`#${this.id} ~ ul input.service`);
          for(var j = 0; j < $childOptions.length; j++) {
            $childOptions[j].checked = false;
          }
        }
    });
  }
}

const selectParent = function() {
  var $options = document.querySelectorAll('input[type="checkbox"].service');
  for(var i = 0; i< $options.length; i++) {
    $options[i].addEventListener( 'change', function() {
      if(this.checked) {
        this.parentElement.parentElement.parentElement.querySelector('input.category').checked = true;
        }
    });
  }
}

function tokenizeURLArgs(url) {
    let result = {};
    let _url = url.replace('/', '').replace('?', '').replace('%20', ' ');
    _url.split('&').map((k) => {
      let item = k.split('=');
      if (item[0] !== '') { result[item[0]] = item[1]; }
    });
    return result;
}

document.addEventListener("DOMContentLoaded", function() {
  const $intro = document.getElementById('intro');
  const $form = document.getElementById('update-form');
  const urlParams = tokenizeURLArgs(window.location.search);
  if (typeof(apiDisabled) !== 'undefined' && apiDisabled) {
    $intro.innerHTML =
    `<div class="error">
      <h1>Service Unavailable</h1>
      <p>The Verification service will be available when the next batch of sites is ready for launch.</p>
    </div>
    `;
    return false;
  }
  if (!urlParams.site) {
    $intro.innerHTML =
    `<div class="error">
      <h1>No sites found</h1>
      <p>You need to use the URL provided by your RMS.</p>
    </div>
    `;
    return false;
  }
  const serviceURL = `https://api.heartland.com/services/v1/${urlParams.site}/?verification=on`;
  const submissionURL = `https://api.heartland.com/services/v1/${urlParams.site}/update/`;
  const svg = {
    checkbox:   '<svg class="icon icon-uncheck"><use xlink:href="#icon-check_box_outline_blank"></use></svg><svg class="icon icon-check"><use xlink:href="#icon-check_box"></use></svg>'
  };
  fetch(serviceURL)
    .then(data => data.json())
    .then(data => {
      if (data.error == false) {
        $intro.innerHTML =
        `<img
          src="https://res.cloudinary.com/heartland-dental/image/upload/c_scale,e_colorize:100,co_rgb:ffffff,h_120/v1/logos/${data.practice_info.content_url}.png"
          alt="${data.practice_info.name} logo"
          width="300"
          class="logo"
        />
        <div class="message">
          <h1>Verify Practice Services for ${data.practice_info.name}</h1>
          <p>Please look over ${data.practice_info.name} and use this page to notify us of any changes to the services offered. Changes made here will appear by the next day, if not sooner. If a service is selected here but is still not shown on your site, then you may request content to be created or modified.</p>
        </div>
        `;
        const keysAlpha = {};
        Object.keys(data.services).sort().forEach(key => {
          keysAlpha[key] = data.services[key];
        });
        $form.innerHTML =
          `<input type="hidden" name="practice_id" value="${data.practice_info.practice_id}" />
          <input type="hidden" name="content_url" value="${data.practice_info.content_url}" />
          <ul class="categories">

            ${Object.keys(keysAlpha).map(k =>
            `<li>
              <input
                type="checkbox"
                ${data.provided_parents[k] ? 'checked' : ''}
                name="services"
                class="category"
                value="${data.parent_ids[k]}" id="id_${data.parent_ids[k]}"
              />
              <label for="id_${data.parent_ids[k]}">
                ${svg.checkbox} ${data.parents[k]}
              </label>

              ${data.services[k].length > 1 ? `
                <p>Please select all that apply</p>
                <ul class="services">
                  ${data.services[k].map(kk => kk.is_parent ? '' : `
                  <li>
                    <input
                      type="checkbox"
                      ${kk.is_provided ? 'checked' : ''}
                      name="services"
                      class="service"
                      id="id_${kk.id}"
                      value="${kk.id}"
                    />
                    <label for="id_${kk.id}" title="${kk.tooltip}">
                      ${svg.checkbox} ${kk.name}
                    </label>
                  </li>`)
                .join('\n')}</ul>` : `
                  <p>No additional content options in the ${data.parents[k]} category.</p>
                `}

              </li>`).join('\n')}

          </ul>
          <label for="authcode">Please enter the authorization code found in your email.</label>
          <input type="text" name="authcode" class="authcode" value="${urlParams.auth ? urlParams.auth : ''}" />
          <input id="submit-button" type="submit" value="Submit">`;

          clearChildren();
          selectParent();

        } else {
        $intro.innerHTML =
        `<div class="error">
          <h1>Error: ${data.message}</h1>
          <p>Double check the link you recieved. If it&rsquo;s incorrect, contact the Digital Marketing team.</p>
        </div>
        `;
      }
    })
    .then(() => {
      const sendData = () => {
        let $response = document.querySelector('div.form .response')
        if ($response) {
          $response.parentNode.removeChild($response);
        }
        fetch(submissionURL, {method: 'post', body: new FormData($form)})
          .then(response => response.json())
          .then(function(data) {
            $intro.removeChild(document.querySelector('.message'));
            let $response = document.createElement("div");
            $response.classList.add("response");
            console.log("error?", data);
            if (data.error) {
              $response.classList.add("error");
              $response.innerHTML = `<p>${data.message}</p>`;
            } else {
              $response.classList.add("success");
              $response.innerHTML = `<p>${data.message}</p>
              <p>Please allow 24-48 for your changes to be made live on your site. If you still don't see the changes, please contact the web team.</p>`;
            }
            $form.innerHTML = '';
            $form.appendChild($response);
            let rand = Math.floor(Math.random() * 10) + 1;
            let $responseGif = document.createElement("div");
            $responseGif.classList.add("success-img");
            $responseGif.innerHTML = `<img src="/assets/images/success${rand}.gif" />`;
            $form.insertBefore($responseGif, $response);
          });
      }

      const $form = document.getElementById('update-form');
      $form.addEventListener('submit', event => {
        event.preventDefault();
        sendData();
      });
    })
    .catch( function() {
      $intro.innerHTML =
      `<div class="error">
        <h1>Unable to connect to API resource</h1>
        <p>Try again later or contact the Digital Marketing team.</p>
      </div>
      `;
    });
});