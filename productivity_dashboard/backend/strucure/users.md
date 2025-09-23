# USERS

## Models:

In models we have four tables and one  class the UserManager() class to handle creation of Users .

```python
class UserManager(BaseUserManager):
.
.

class User(AbstractUser, PermissionMixin): 
.
.

class UserAxtivity(models.Model):
.
.

class PaymentMethod(models.Model):  
.
.

class Subscription(models.Model):

```
    
### This allows: 
 - us to create and stoe user data

