{*
  This layout is used for all the 'public' modules
  (i.e Loris modules or pages that don't require user to be logged in)
*}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{$page_title}</title>
  <link rel="stylesheet" href="{$baseurl}/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="{$baseurl}/css/public_layout.css">
  <link type="image/x-icon" rel="icon" href="{$baseurl}/images/favicon.ico">
  {section name=jsfile loop=$jsfiles}
    <script src="{$jsfiles[jsfile]}" type="text/javascript"></script>
  {/section}

  {section name=cssfile loop=$cssfiles}
    <link rel="stylesheet" href="{$cssfiles[cssfile]}">
  {/section}
</head>
<body>
  <header class="header">
    <div class="container">
      <div class="flex-wrapper">
        <div class="loris-logo col-md-4 col-xs-12 col-sm-6">
          <a href="{$baseurl}"
             rel="noopener noreferrer">
            <img src="{$baseurl}/images/PreventAD_logo.svg" class="loris-logo img-responsive" alt="PreventAD Logo"/>
          </a>
        </div>
        <div class="study-title hidden-xs col-md-8 col-sm-6">
          {$study_title}
        </div>
        <div class="mcgill-logo hidden-xs hidden-sm col-md-4">
          <a href="https://mcgill.ca/"
             target="_blank"
             rel="noopener noreferrer">
            <img src="{$baseurl}/images/mcgill_logo.png" class="img-responsive" alt="McGill University"/>
            </a>
            </div>
      </div>
    </div>
  </header>
  <section class="main-content">
    {$workspace}
  </section>
  <footer class="footer">
      <div class="container">
          <div class="flex-wrapper">
              <div class="container col-md-2 col-md-offset-2">
                  <a href="https://github.com/aces/Loris"
                     target="_blank"
                     rel="noopener noreferrer">
                      <img src="/images/LORIS_logo_white.svg" class="img-responsive"/>
                  </a>
              </div>
              <div class="container col-md-4">
                  <p>Powered by <a href="https://loris.ca" target="_blank" rel="noopener noreferrer">LORIS</a> | GPL-3.0 &copy; {$currentyear}<br/>Developed at <a href="https://www.mcgill.ca/neuro/" target="_blank" rel="noopener noreferrer">Montreal Neurological Institute and Hospital</a> by <a href="https://mcin.ca" target="_blank" rel="noopener noreferrer">MCIN</a></p>
              </div>
              <div class="container col-md-2 col-md-offset-2"></div>
          </div>
      </div>
  </footer>
  <script src="{$baseurl}/js/modernizr/modernizr.min.js"/>
  <script>
    if (!Modernizr.webgl) {
      alert("Please download the latest version of Google Chrome of Mozilla Firefox in order to use Loris!");
    }
  </script>
</body>
</html>
