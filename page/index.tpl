{%extends file="./layout.tpl"%}

{%block name="menu"%}
    {%widget name="site:widget/menu/menu.tpl"%}
{%/block%}

{%block name="main"%}
    {%require name="site:page/index.tpl"%}
    {%widget name="site:widget/main/main.tpl"%}
{%/block%}
