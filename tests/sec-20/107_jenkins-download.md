# Downloading & Starting Jenkins Locally — Section Notes

## Steps
1. Download the **Generic Java package (.war)** from [jenkins.io/download](https://www.jenkins.io/download/) (LTS is the safe choice; ~55–70 MB).
2. Install a supported **Java (JDK/JRE)** — see below. Without it Jenkins cannot start.
3. In a terminal, `cd` to the folder containing `jenkins.war` (e.g. `~/Downloads`).
4. Start it:
   ```bash
   java -jar jenkins.war --httpPort=9090
   ```
   (`-jar` = run an executable jar/war; `--httpPort` = port to listen on. The default is 8080, which is often already used by other software, hence 9090.)
5. Wait for the log line `Jenkins is fully up and running`. The log also prints the **initial admin password** between two rows of asterisks (also stored at `~/.jenkins/secrets/initialAdminPassword`).
6. Open `http://localhost:9090`, paste the password, choose **Install suggested plugins**, create the first admin user, and you land on the Jenkins dashboard.
7. Keep that terminal open — closing it (or Ctrl+C) stops Jenkins. Jenkins data lives in `~/.jenkins`.

Next lecture: create a Jenkins job that runs our `npm run ...` scripts (see [106_scripts.md](./106_scripts.md)).

## Troubleshooting: "Unable to locate a Java Runtime" (macOS)
```
The operation couldn't be completed. Unable to locate a Java Runtime.
```
macOS ships only a stub `/usr/bin/java`; no real Java is installed. Fix:
```bash
brew install --cask temurin@21      # OpenJDK 21 (Eclipse Temurin); asks for your Mac password
# or: brew install openjdk@21  (then link it, see brew's "caveats" output)
```
Open a **new** terminal and verify:
```bash
java -version            # should print version 21.x (or 25.x)
/usr/libexec/java_home -V
```
If several JDKs are installed, pick one for the session:
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```
Then re-run `java -jar jenkins.war --httpPort=9090`.

## Recent changes vs. the lecture (important)
- **Java version requirement has moved up.** Current Jenkins requires **Java 21 or 25**
  (Java 25 support: LTS 2.541.1, Jan 2026). **Java 17 is no longer supported** — its last
  LTS was 2.541.3 (Mar 2026) — and Java 8/11 are long gone. An unsupported Java version
  means the controller simply will not run. Source:
  [Jenkins Java support policy](https://www.jenkins.io/doc/book/platform-information/support-policy-java/).
  The `jenkins.war` downloaded here is 2.580.1, built with JDK 21.
- Lecture-era tutorials mention Java 8/11 and "JRE only" — ignore those.
- Recent Jenkins versions use `--httpPort=...` (double dash); the single-dash form from
  older videos usually still works but the double dash is the documented one.
- The setup wizard now recommends installing suggested plugins and creating an admin user
  right away (the generated password is only for first unlock).
- Running the `.war` directly is fine for learning; for real/shared use Jenkins recommends
  Docker or a native package/service install.








command
cat ~/.jenkins/secrets/initialAdminPassword