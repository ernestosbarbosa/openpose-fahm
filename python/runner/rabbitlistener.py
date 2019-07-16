import cv2
import json
import os
import sys

import pika

dir_path = os.path.dirname(os.path.realpath(__file__)) + "/../../build/python"
sys.path.append(dir_path + '/openpose')
from openpose import *

params = dict()
params["logging_level"] = 3
params["output_resolution"] = "-1x-1"
params["net_resolution"] = "-1x368"
params["model_pose"] = "BODY_25"
params["alpha_pose"] = 0.6
params["scale_gap"] = 0.3
params["scale_number"] = 1
params["render_threshold"] = 0.05
params["num_gpu_start"] = 0
params["disable_blending"] = False
params["default_model_folder"] = dir_path + "/../../../models/"

upload_dir = "/home/user/Documentos/upload/"
completed_dir = "/home/user/Documentos/completed/"

openpose = OpenPose(params)

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()

channel.queue_declare(queue='start')
def callback(ch, method, properties, body):
    print(" [x] Received %r" % body)
    print(body)
    fileName = body

    #implementar/analisar
    while 1:
        cap = cv2.VideoCapture(upload_dir + body)

        if (cap.isOpened()== False): 
            print("Erro ao abrir o arquivo")

        f = open(completed_dir + body + ".json","w+")

        f.write("[")
        while(cap.isOpened()):
            ret, frame = cap.read()
            if ret == True:
                keypoints, output_image = openpose.forward(frame, True)
                resp = json.dumps(keypoints.tolist())
                f.write(resp)
                f.write(",")
            else: 
                break
        
        f.write("[]]")
        f.close()
        cap.release()

        channelProcess = connection.channel()
        channelProcess.queue_declare(queue='process')
        channelProcess.basic_publish(exchange='',
                            routing_key='process',
                            body=body)

        break

    print(" [x] Done")
    ch.basic_ack(delivery_tag = method.delivery_tag)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(callback,
                      queue='start')

print(' [*] Waiting for messages. Press CTRL+C to exit')
channel.start_consuming()
