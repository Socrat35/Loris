{function RecursivePrint}
    <ul>
    {foreach $person_affiliations as $affiliation}
        {if is_array($affiliation)}
        <li class="item">{$affiliations[$affiliation@key]["Name"]}, {$affiliations[$affiliation@key]["City"]}, {$affiliations[$affiliation@key]["StateCode"]}, {$affiliations[$affiliation@key]["CountryCode"]}</li>
        {RecursivePrint person_affiliations=$affiliation}
        {else}
         <li class="item">{$affiliation}</li>
        {/if}
    {/foreach}
    </ul>
{/function}
{function DisplayContributors}
    {foreach from=$Contributors item=person}
    <tr class="{$RowClass}">
        <td class="text-center">{$person["Full Name"]}</td>
        <td class="text-center">{$person["Citation Name"]}</td>
        <td class="align-center">{RecursivePrint person_affiliations=$person["Affiliation IDs"]}</td>
        <td>
            <ul>
                {foreach from=$person["Degree IDs"] item=degreeIDs}
                <li>{$degrees[$degreeIDs]["Abbreviation"]}</li>
                {foreachelse}
                {/foreach}
            </ul>
        </td>
        <td>
            <ul>
                {foreach from=$person["Title IDs"] item=titleIDs}
                <li>{$titles[$titleIDs]["Abbreviation"]}</li>
                {foreachelse}
                {/foreach}
            </ul>
        </td>
        <td>
            <ul>
                {foreach from=$person["Role IDs"] item=roleIDs}
                <li>{$roles[$roleIDs]["Name"]}</li>
                {foreachelse}
                {/foreach}
            </ul>
        </td>
    </tr>
    {/foreach}
{/function}
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content={if $authorship == "1"}"List of the Authors for the PREVENT-AD Dataset"{else}"Acknowledgements for the contributors to the PREVENT-AD Dataset"{/if}>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/{$css}' />
        <link rel='stylesheet' type='text/css' href='{$baseurl}/css/loris-jquery/jquery-ui-1.10.4.custom.min.css' />
        <link rel='stylesheet' type='text/css' href='{$baseurl}/bootstrap/css/bootstrap.min.css'>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/bootstrap/css/custom-css.css'>
        <link rel='stylesheet' type='text/css' href='{$baseurl}/css/acknowledgements.css' />
        <link rel="shortcut icon" type="image/ico" href="{$baseurl}/images/PreventAD.ico" />
        <title>{if $authorship == "1"}Authorship{else}Acknowledgements{/if}</title>
    </head>
    <body>
        <div class="page-header-banner">
            <img class="logo img-responsive" src="{$baseurl}/images/preventadlogo.png"/>
        </div>
        <div id="tabs">
            <h1>{if $authorship == "1"}Authorship List for the PREVENT-AD Dataset{else}Acknowledgements for the contributors to the PREVENT-AD Dataset{/if}</h1>
            <h4>{if $authorship == "1"}For the Acknowledgements List, click <a href="{$baseurl}/acknowledgements/xanadu.php?date={$date}">here</a>.{else}For the Authorship List, click <a href="{$baseurl}/acknowledgements/xanadu.php?date={$date}&authors">here</a>.{/if}</h4>
            <div class="tab-content">
                <div class="tab-pane active">
                    <table class='table table-bordered'>
                        <thead>
                            <tr class='info'>
                                {foreach from=$columns key=columnName item=ColumnDisplayName}
                                <th class="text-center">{$ColumnDisplayName}</th>
                                {/foreach}
                            </tr>
                        </thead>
                        <tbody>
                            {DisplayContributors Contributors=$currentContributors RowClass="table-primary"}
                            {if !empty($pastContributors)}
                                <tr><td colspan="6"><hr/><span class="table-separator">Past Contributors</span><hr/></tr>
                            {DisplayContributors Contributors=$pastContributors RowClass="table-secondary"}
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="downloadButtons">
            <form method='post'>
                <div>
                    <input class='btn btn-primary' name="XML" type='submit' value='Download as XML' />
                    <input class='btn btn-primary' name="TSV" type='submit' value='Download as TSV' />
                </div>
            </form>
        </div>
    </body>
</html>
