use std::path::PathBuf;
use std::str::FromStr;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(untagged)]
pub enum ServeStaticConfig {
    #[serde(deserialize_with = "deserialize_dir")]
    DirOnly(PathBuf),
    RoutesAndDir(RoutesAndDir),
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct RoutesAndDir {
    pub routes: Vec<String>,
    #[serde(deserialize_with = "deserialize_dir")]
    pub dir: PathBuf,
}

impl ServeStaticConfig {
    pub fn from_dir_only(path: impl Into<PathBuf>) -> Self {
        ServeStaticConfig::DirOnly(path.into())
    }
    pub fn try_path_buf(item: &str) -> Result<PathBuf, ServeStaticError> {
        match ServeStaticConfig::from_str(item) {
            Ok(ServeStaticConfig::DirOnly(pb)) => Ok(pb),
            Ok(ServeStaticConfig::RoutesAndDir(..)) => Err(ServeStaticError::Invalid),
            Err(e) => Err(e),
        }
    }
}

impl Default for ServeStaticConfig {
    fn default() -> Self {
        ServeStaticConfig::from_dir_only(".")
    }
}

impl std::str::FromStr for ServeStaticConfig {
    type Err = ServeStaticError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let split = s.split(':').collect::<Vec<&str>>();
        match split.as_slice() {
            [one] => {
                if one.is_empty() {
                    Err(ServeStaticError::Empty)
                } else {
                    Ok(ServeStaticConfig::from_dir_only(one))
                }
            }
            [rs @ .., dir] => {
                let as_routes = rs.iter().map(|s| s.to_string()).collect::<Vec<String>>();
                let dir = ServeStaticConfig::try_path_buf(dir)?;
                Ok(ServeStaticConfig::RoutesAndDir(RoutesAndDir {
                    dir,
                    routes: as_routes,
                }))
            }
            _ => {
                println!("got here2");
                todo!("here")
            }
        }
    }
}

#[test]
fn ss_from_str() -> anyhow::Result<()> {
    let ss = ServeStaticConfig::from_str("node_modules")?;
    assert_eq!(
        ss,
        ServeStaticConfig::DirOnly(PathBuf::from("node_modules"))
    );

    let ss = ServeStaticConfig::from_str("/node:node_modules")?;
    assert_eq!(
        ss,
        ServeStaticConfig::RoutesAndDir(RoutesAndDir {
            dir: PathBuf::from("node_modules"),
            routes: vec!["/node".into()]
        })
    );

    let ss = ServeStaticConfig::from_str("");
    assert!(ss.is_err());

    let ss = ServeStaticConfig::from_str("router:");
    assert!(ss.is_err());

    Ok(())
}

#[derive(thiserror::Error, Debug)]
pub enum ServeStaticError {
    #[error("Invalid serve static option")]
    Invalid,
    #[error("unknown serve static error")]
    Unknown,
    #[error(
        "directory path cannot be empty

    Here's an example of a valid option

    --serve-static /node_modules:node_modules
    "
    )]
    Empty,
}

///
/// Helpers for deserializing a dir argument
///
/// todo: add verification here
///
pub fn deserialize_dir<'de, D>(deserializer: D) -> Result<PathBuf, D::Error>
where
    D: serde::de::Deserializer<'de>,
{
    struct DirVisitor;

    impl<'de> serde::de::Visitor<'de> for DirVisitor {
        type Value = PathBuf;

        fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
            formatter.write_str("either `7.1`, `7.2`, `7.3` or `7.4`")
        }
        fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
        where
            E: serde::de::Error,
        {
            // let r: Result<PathBuf, _> = Ok();
            // r.map_err(E::custom)
            match ServeStaticConfig::from_str(v) {
                Ok(ServeStaticConfig::DirOnly(pb)) => Ok(pb),
                _ => unreachable!("should not get here when deserializing a dir - {}", v),
            }
        }
    }

    deserializer.deserialize_any(DirVisitor)
}
