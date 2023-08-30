<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel='stylesheet' type='text/css' href='{$baseurl}/{$css}' />
        <link rel='stylesheet' type='text/css' href='{$baseurl}/css/loris-jquery/jquery-ui-1.10.4.custom.min.css' />
        <link rel='stylesheet' type='text/css' href='{$baseurl}/bootstrap/css/bootstrap.min.css'>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/bootstrap/css/custom-css.css'>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/css/acknowledgements.css' />
        <link rel="shortcut icon" type="image/ico" href="{$baseurl}/images/PreventAD.ico" />
        <title>Error</title>
    </head>
    <body>
    <div class="page-header">
        <img class="logo img-responsive" src="{$baseurl}/images/preventadlogo.png"/>
    </div>
    <div class="page-content">
        <h1>Error</h1>
        {if $error == "1"}
            <p> One, or more, of the parameters you've passed ({", "|implode:$parameters}) are invalid. </p>
            <p>This page requires the <span class="bold emphasis">date</span> parameter and only supports an optional
                <span class="bold emphasis">authors</span> parameter. The <span class="bold emphasis">date</span>
                parameter is associated with the publication date of the article, as in all contributors before said
                date, and the <span class="bold emphasis">authors</span> parameter filters out non-authors.</p>
            <p><span class="bold">For example:</span></p>
            <p><span class="emphasis">{$baseurl}/acknowledgements/xanadu.php?<span class="bold">date</span>=2023-03-03</span></p>
            <p><span class="bold">Or</span></p>
            <p><span class="emphasis">{$baseurl}/acknowledgements/xanadu.php?<span class="bold">date</span>=2023-03-03&<span class="bold">authors</span></span></p>
        {elseif $error == "2"}
            <p>The date you've entered is invalid. Please respect the format YYYY-MM-DD.</p>
            <p><span class="bold">For example:</span></p>
            <p><span class="emphasis">{$baseurl}/acknowledgements/xanadu.php?<span class="bold">date</span>=2023-03-03</span></p>
        {elseif $error == "3"}
            <p>You've tried assigning a value to the <span class="bold emphasis">authors</span> parameter. This parameter is a switch only. Please respect
                the supported format.</p>
            <p><span class="bold">For example:</span></p>
            <p><span class="emphasis">{$baseurl}/acknowledgements/xanadu.php?<span class="bold">date</span>=2023-03-03&<span class="bold">authors</span></span></p>
        {else}
            <p>This element should never be displayed. If you're seeing this, please advise your closest developer.</p>
        {/if}
    </div>
    </body>
</html>
