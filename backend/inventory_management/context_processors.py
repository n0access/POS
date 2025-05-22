
def user_role(request):
    if request.user.is_authenticated:
        # Get the first group name or default to 'User'
        groups = request.user.groups.all()
        if groups.exists():
            role = groups[0].name
        else:
            role = 'User'
    else:
        role = 'Anonymous'
    return {'user_role': role}