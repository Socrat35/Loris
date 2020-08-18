<link rel="stylesheet" href="{$baseurl}/css/c3.css">

<div class="row">
    <div class="col-lg-8">

        <!-- Welcome panel -->
        <div class="panel panel-default">
            <div class="panel-body">
                <h3 class="welcome">Welcome, {$username}.</h3>
                <p class="pull-right small login-time">Last login: {$last_login}</p>
                {if !is_null($project_description)}
                    <p class="project-description">
                        <p>PREVENT-AD open data are accessible via this LORIS web browser, and also available for mass download using the LORIS API (see the link below for data download instructions).</p>

                        <p>The first release includes longitudinal data from 308 participants either in the observational cohort or from INTREPAD, the main clinical trial. INTREPAD (<b>I</b>nvestigation of <b>N</b>aproxen as a <b>TRE</b>atment for <b>P</b>revention of <b>A</b>lzheimer’s <b>D</b>isease) is a double-blind, placebo controlled, randomized trial of naproxen sodium 220 mg or placebo twice daily.</p>

                        <p>Available data includes structural and functional Magnetic Resonance Imaging (MRI), and basic demographics (age at MRI, Gender, Study language, Handedness).</p>
                    </p>
                {/if}
            </div>
            <!-- Only add the welcome panel footer if there are links -->
            {if $dashboard_links neq ""}
                <div class="panel-footer">|
                    <a href="https://douglas.research.mcgill.ca/stop-ad-centre" target="_blank">StoP-AD Centre</a>
                    |
                    <a href="https://prevent-alzheimer.net/" target="_blank">PREVENT-AD</a>
                    |
                    <a href="https://openpreventad.loris.ca/document_repository/ajax/GetFile.php?File=admin%2FHow%20to%20get%20the%20data.pdf">How to download data</a>
                    |
                    <a href="https://openpreventad.loris.ca/document_repository/ajax/GetFile.php?File=admin%2FPREVENT-AD%20short%20description.pdf">Short study description</a>
                    |
                    <a href="https://openpreventad.loris.ca/document_repository/ajax/GetFile.php?File=admin%2FMRI%20protocol%20for%20open%20science.pdf">MRI protocols</a>
                    |
                </div>
            {/if}
        </div>

        <!-- Recruitment -->
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Cohort Description</h3>
                <span class="pull-right clickable glyphicon glyphicon-chevron-up"></span>
                <div class="pull-right">
                    <div class="btn-group views">
                        <ul class="dropdown-menu pull-right" role="menu">
                            <li class="active"><a data-target="overall-recruitment">View overall recruitment</a></li>
                            <li><a data-target="recruitment-site-breakdown">View site breakdown</a></li>
                            {if $useProjects eq "true"}
                                <li><a data-target="recruitment-project-breakdown">View project breakdown</a></li>
                            {/if}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="panel-body">
                <div class="container-fluid">
                    <div class="row">
                        <div>
                            {include file='progress_bar.tpl' project=$recruitment["overall"]}
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-xs-4" style="display: inline-block; margin: auto">
                            <h5>Handedness distribution:</h5>
                            <div id="handednessPieChart"></div>
                        </div>
                        <div class="col-xs-4" style="display: inline-block; margin: auto">
                            <div style="width: 350px;">
                                <h5>Age distribution at BL:</h5>
                            </div>
                            <div id="ageBarChart"></div>
                        </div>
                        <div class="col-xs-4" style="display: inline-block; margin: auto">
                            <h5>Language distribution:</h5>
                            <div id="languagePieChart"></div>
                        </div>
                    </div>
                </div>
                {if $useProjects eq "true"}
                    <div class="recruitment-panel hidden" id="recruitment-project-breakdown">
                        {foreach from=$recruitment key=ID item=project}
                            {if $ID != "overall"}
                                {include file='progress_bar.tpl' project=$project}
                            {/if}
                        {/foreach}
                    </div>
                {/if}
            </div>
        </div>

        <!-- Charts -->
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Cohort Progression</h3>
                <span class="pull-right clickable glyphicon glyphicon-chevron-up"></span>
                <div class="pull-right">
                    <div class="btn-group views">
                        <ul class="dropdown-menu pull-right" role="menu">
                            <li class="active"><a data-target="scans-line-chart-panel">View scans per site</a></li>
                            <li><a data-target="recruitment-line-chart-panel">View recruitment per site</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="panel-body">
                <div id="scans-line-chart-panel">
                    <div id="cohortProgressionBarChart"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-lg-4">

        <div class="col-lg-12 col-md-6 col-sm-6 col-xs-12">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h3 class="panel-title">PREVENT-AD timeline</h3>
                    <span class="pull-right clickable glyphicon glyphicon-chevron-up"></span>
                </div>
                <!-- /.panel-heading -->
                <div class="panel-body">
                    <img src="images/PREVENT-AD_timeline.png" class = "img-responsive" width = "100%" />
                    <p class="project-description">
                    <p><b>EL</b>: Eligibility; <b>EN</b>: enrolment; <b>BL</b>: baseline; <b>FU</b>: follow-up; <b>00, 03, 12, 24, 36, 48</b>: number of months after BL.</p> 
                    <p><b>*</b> Additional time point, for the INTREPAD trial only.</p>
                    <p>For a more detailed explanation of PREVENT-AD's visit labels, please see the document called "PREVENT-AD visit label description" in the LORIS "Document Repository" under the "Tools" menu.</p>
                    </p>
                </div>
                <!-- /.panel-body -->
            </div>
        </div>

        <!-- Document Repository -->
        {if $document_repository_notifications neq ""}
            <div class="col-lg-12 col-md-6 col-sm-6 col-xs-12">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        <h3 class="panel-title">Document Repository Notifications</h3>
                        <span class="pull-right clickable glyphicon glyphicon-chevron-up"></span>
                    </div>
                    <!-- /.panel-heading -->
                    <div class="panel-body">
                        <div class="list-group document-repository-item">
                            {foreach from=$document_repository_notifications item=link}
                                <a href="AjaxHelper.php?Module=document_repository&script=GetFile.php&File={$link.Data_dir}"
                                   download="{$link.File_name}" class="list-group-item">
                                    {if $link.new eq 1}
                                        <span class="pull-left new-flag">NEW</span>
                                    {/if}
                                    <span class="pull-right text-muted small">Uploaded: {$link.Date_uploaded}</span>
                                    <br>
                                    {$link.File_name}
                                </a>
                            {/foreach}
                        </div>
                        <!-- /.list-group -->
                        <a href="{$baseURL}/document_repository/" class="btn btn-default btn-block">Document Repository
                            <span class="glyphicon glyphicon-chevron-right"></span></a>
                    </div>
                    <!-- /.panel-body -->
                </div>
            </div>
        {/if}

    </div>
</div>
