# Package
tar --exclude='./node_modules' --exclude='./tt_images/originals' --exclude='./deploy.sh' --exclude='./gulpfile.js' --exclude='./package.json' -zcvf terrarium.tar.gz .

# Ship
scp -i ~/.ssh/digitalocean_nl terrarium.tar.gz root@198.199.104.48:/../var/www/

# Unpack
ssh -i ~/.ssh/digitalocean_nl root@198.199.104.48 'cd ../var/www/; rm -rf terrariumtravel.com; mkdir terrariumtravel.com; tar -xvf terrarium.tar.gz -C terrariumtravel.com --strip 1; rm terrarium.tar.gz;'

# Clean Up
rm terrarium.tar.gz
