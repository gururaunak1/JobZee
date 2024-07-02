import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState({});
  const [postedByIds, setPostedByIds] = useState([]);

  // it is use to check that the user is Authenticated
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    try {
      axios
        .get("http://localhost:4000/api/v1/job/getall", {
          withCredentials: true,
        })
        .then((res) => {
          setJobs(res.data.jobs); // Assuming jobs are in res.data.jobs

          // Extract all unique postedByIds from jobs
          const uniquePostedByIds = Array.from(
            new Set(res.data.jobs.map((job) => job.postedBy))
          );
          setPostedByIds(uniquePostedByIds);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    // Fetch user details for each unique postedById
    const fetchUsers = async () => {
      try {
        const promises = postedByIds.map(async (id) => {
          const response = await axios.get(
            `http://localhost:4000/api/v1/user/${id}`,
            {
              withCredentials: true,
            }
          );
          return { id, user: response.data.user };
        });

        // Wait for all promises to resolve and update state with user details
        const usersData = await Promise.all(promises);
        const usersMap = {};
        usersData.forEach((userData) => {
          usersMap[userData.id] = userData.user;
        });
        setUsers(usersMap);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, [postedByIds]);

  if (!isAuthorized) {
    navigateTo("/");
  }

  return (
    <section className="jobs page">
      <div className="container">
        <h1>ALL AVAILABLE JOBS</h1>
        <div className="banner">
          {/* if jobs have job which is true then we will map things */}
          {jobs.map((element) => (
            <div className="card" key={element._id}>
              <p>{element.title}</p>
              <p>{element.category}</p>
              <p>{element.country}</p>
              {/* Display user name if user exists in users state */}
              {users[element.postedBy] && (
                <p>Posted By: {users[element.postedBy].name}</p>
              )}
              <Link to={`/job/${element._id}`}>Job Details</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
