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
        <div class="error-container container col-md-8 col-md-offset-2">
            <div class="col-md-4">
                <img class="img-responsive" src="{$baseurl}/images/preventadlogo.png"/>
            </div>
            <div class="col-md-8">
                <h1>Error</h1>
            {if $error == "1"}
                <p> One, or more, of the parameters you've passed ({", "|implode:$parameters}) are either invalid or superfluous.</p>
                <p>This page requires, exclusively, either the <span class="bold emphasis">date</span>, the <span class="bold emphasis">DR</span> or the <span class="bold emphasis">Stage</span> parameter and only supports an optional <span class="bold emphasis">authors</span> parameter. The <span class="bold emphasis">date</span> parameter returns the list at the date specified while the <span class="bold emphasis">DR</span> and <span class="bold emphasis">Stage</span> parameters return the list at the time of a specific internal data release or an open science stage, respectively, and the <span class="bold emphasis">authors</span> parameter filters out non-authors.</p>
            </div>
            <div class="col-md-12">
                <h2>Examples</h2>
                <h3>With the date</h3>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">date</span>=2023-03-03</span></p>
                <p><span class="bold">Or</span></p>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">date</span>=2023-03-03&<span class="bold">authors</span></span></p>
                <h3>With the internal data releases</h3>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">DR</span>=7.0</span></p>
                <p><span class="bold">Or</span></p>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">DR</span>=7.0&<span class="bold">authors</span></span></p>
                <h3>With the open science stages</h3>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">Stage</span>=1</span></p>
                <p><span class="bold">Or</span></p>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">Stage</span>=1&<span class="bold">authors</span></span></p>
            </div>
            {elseif $error == "2"}
                <p>The date you've entered is invalid. Please respect the format YYYY-MM-DD.</p>
            </div>
            <div class="col-md-12">
                <h2>Examples</h2>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">date</span>=2023-03-03</span></p>
            </div>
            {elseif $error == "3"}
                <p>You've tried assigning a value to the <span class="bold emphasis">authors</span> parameter. This parameter is a switch only. Please respect the supported format.</p>
            </body>
            <div class="col-md-12">
                <h2>Examples</h2>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">date</span>=2023-03-03&<span class="bold">authors</span></span></p>
            </div>
            {elseif $error == "4"}
                <p>The data release you've entered is invalid. Please respect the format of a major version, a period and a subversion.</p>
            </html>
            <div class="col-md-12">
                <h2>Examples</h2>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">DR</span>=7.0</span></p>
            </div>
            {elseif $error == "5"}
                <p>The data release you've entered doesn't exist. Please enter a valid data release.</p>
            </div>
            <div class="col-md-12">
                <h2>Examples</h2>
                <ul>
                    {foreach from=$data_releases key=version item=dataRelease}
                        <li><span class="emphasis bold">Data Release {$version}</span> ({$dataRelease})</li>
                        {foreachelse}
                        <li>No Data Releases are currently registered in the system. Please contact the team to signal the issue.</li>
                    {/foreach}
                </ul>
            </div>
            {elseif $error == "6"}
                <p> You've passed no parameters.</p>
                <p>This page requires, exclusively, either the <span class="bold emphasis">date</span>, the <span class="bold emphasis">DR</span> or the <span class="bold emphasis">Stage</span> parameter and only supports an optional <span class="bold emphasis">authors</span> parameter. The <span class="bold emphasis">date</span> parameter returns the list at the date specified while the <span class="bold emphasis">DR</span> and <span class="bold emphasis">Stage</span> parameters return the list at the time of a specific internal data release or an open science stage, respectively, and the <span class="bold emphasis">authors</span> parameter filters out non-authors.</p>
            </div>
            <div class="col-md-12">
                <h2>Examples</h2>
                <h3>With the date</h3>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">date</span>=2023-03-03</span></p>
                <p><span class="bold">Or</span></p>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">date</span>=2023-03-03&<span class="bold">authors</span></span></p>
                <h3>With the internal data releases</h3>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">DR</span>=7.0</span></p>
                <p><span class="bold">Or</span></p>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">DR</span>=7.0&<span class="bold">authors</span></span></p>
                <h3>With the open science stages</h3>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">Stage</span>=1</span></p>
                <p><span class="bold">Or</span></p>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">Stage</span>=1&<span class="bold">authors</span></span></p>
            </div>
            {elseif $error == "8"}
                <p>The Stage you've entered is invalid. Please respect the format of a integer.</p>
            </div>
            <div class="col-md-12">
                <h2>Examples</h2>
                <p><span class="emphasis">{$baseurl}/acknowledgements/acknowledgements.php?<span class="bold">Stage</span>=1</span></p>
            </div>
            {elseif $error == "9"}
                <p>The Stage you've entered doesn't exist. Please enter a valid stage.</p>
            </div>
            <div class="col-md-12">
                <h2>Examples</h2>
                <ul>
                    {foreach from=$stage_releases key=version item=stage}
                        <li><span class="emphasis bold">Stage {$version}</span> ({$stage})</li>
                    {foreachelse}
                        <li>No Stages are currently registered in the system. Please contact the team to signal the issue.</li>
                    {/foreach}
                </ul>
            </div>
            {else}
                <p>This element should never be displayed. If you're seeing this, please advise your closest developer.</p>
            </div>
            {/if}
        </div>
    </body>
</html>
