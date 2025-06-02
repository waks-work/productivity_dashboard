from tkinter import CASCADE
from turtle import mode
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Creates and saves a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model where email is the unique identifier
    for authentication instead of usernames.
    """
    email = models.EmailField(_('email address'), unique=True)
    timezone = models.CharField(_('timezone'), max_length=50, default='UTC')
    profile_pic = models.ImageField(
        _('profile picture'),
        upload_to='profile/',
        null=True,
        blank=True
    )
    is_verified = models.BooleanField(_('verified'), default=False)
    is_premium = models.BooleanField(_('premium'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    is_staff = models.BooleanField(_('staff status'), default=False)
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)

    username = None  # Remove username field

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    # Permission related fields
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_('The groups this user belongs to.'),
        related_name="custom_user_groups",
        related_query_name='user',
    )

    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name="custom_user_permissions",
        related_query_name='user',
    )

    def __str__(self):
        return self.email

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')


class UserActivity(models.Model):
    """
    Tracks user login activities
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activities',
        verbose_name=_('user')
    )
    last_login = models.DateTimeField(_('last login'), auto_now=True)
    ip_address = models.GenericIPAddressField(_('IP address'))

    class Meta:
        verbose_name = _('user activity')
        verbose_name_plural = _('user activities')

    def __str__(self):
        return f"{self.user.email} - {self.last_login}"

class PaymentMethod(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete= models.CASCADE)
    stripe_id =models.CharField(max_length=100)
    is_default = models.BooleanField(default = False)
    added_at = models.DateTimeField(auto_now_add = True)


class Subscription(models.Model):
    user =models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete= models.CASCADE,
        related_name='subscription'
        )
    plan = models.CharField(max_length=20, choices = [
        ('basic','Basic'),
        ('premium','Premium')
    ])
    status = models.CharField(max_length=20,default='active')
    renews_on = models.DateField()
    stripe_subscription_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan}"