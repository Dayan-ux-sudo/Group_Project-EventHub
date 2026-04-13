from django.shortcuts import render


def root(request):
    return render(request, "eventhub/admin_dashboard.html")
