    <div id="menu-event" class="pure-menu pure-menu-open">
        <a class="pure-menu-heading" href="/site/page/index" page-data="site_widget_main_main">Pure</a>

        <ul>
            <li class=" ">
                <a href="/site/page/base" page-data="site_widget_base_base">Base</a>
            </li>
          
            <li class=" ">
                <a href="/site/page/grids" page-data="site_widget_grids_grids">Grids</a>
            </li>
          
        </ul>
    </div>
{%script%}
$('#menu-event  a').click(function(event) {
    event.preventDefault();
    BigPipe.refresh(this.href + '?pagelets=' + $(this).attr('page-data'), 'main');
});
{%/script%}